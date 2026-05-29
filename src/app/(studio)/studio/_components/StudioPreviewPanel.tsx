"use client";

import type { Room } from "livekit-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { StudioLifecycleActions } from "./StudioLifecycleActions";
import type { StudioCameraControl, StudioMicControl } from "./StudioTopChrome";
import { StudioPreviewScene } from "./studio-preview-panel/StudioPreviewScene";
import { useStudioMicUtilitySurface } from "./useStudioMicUtilitySurface";
import { useStudioPreviewMediaPolish } from "./useStudioPreviewMediaPolish";
import { useStudioPublishedCameraSwitch } from "./useStudioPublishedCameraSwitch";
import { useStudioPublishFoundation } from "./useStudioPublishFoundation";
import { useStudioPreviewBootstrap } from "./useStudioPreviewBootstrap";

export type StudioExitControlState = {
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStopping: boolean;
  lifecycleMessage: string | null;
  requestStopForExit: () => Promise<boolean>;
};

type StudioPreviewPanelProps = {
  lifecycle: {
    kind: "idle" | "live" | "degraded";
  };
  onCameraControlChange?: (cameraControl: StudioCameraControl | null) => void;
  onExitControlChange?: (state: StudioExitControlState) => void;
  onMicControlChange?: (micControl: StudioMicControl | null) => void;
  onPublisherRoomChange?: (room: Room | null) => void;
  username: string;
};

type StartSuccessFeedbackSnapshot = {
  isVisible: boolean;
  token: number;
  visibleUntil: number;
};

const START_SUCCESS_FEEDBACK_DURATION_MS = 1800;

let startSuccessFeedbackSnapshot: StartSuccessFeedbackSnapshot = {
  isVisible: false,
  token: 0,
  visibleUntil: 0
};
let startSuccessFeedbackDeferredClearTimeout: ReturnType<typeof setTimeout> | null =
  null;

function cancelStartSuccessFeedbackDeferredClear() {
  if (!startSuccessFeedbackDeferredClearTimeout) {
    return;
  }

  clearTimeout(startSuccessFeedbackDeferredClearTimeout);
  startSuccessFeedbackDeferredClearTimeout = null;
}

function clearStartSuccessFeedbackSnapshot() {
  startSuccessFeedbackSnapshot = {
    isVisible: false,
    token: 0,
    visibleUntil: 0
  };
}

function hasActiveStartSuccessFeedbackSnapshot(token: number) {
  return (
    startSuccessFeedbackSnapshot.isVisible &&
    startSuccessFeedbackSnapshot.token === token &&
    startSuccessFeedbackSnapshot.visibleUntil > Date.now()
  );
}

function scheduleStartSuccessFeedbackDeferredClear() {
  cancelStartSuccessFeedbackDeferredClear();
  startSuccessFeedbackDeferredClearTimeout = setTimeout(() => {
    clearStartSuccessFeedbackSnapshot();
    startSuccessFeedbackDeferredClearTimeout = null;
  }, 0);
}

export function StudioPreviewPanel({
  lifecycle,
  onCameraControlChange,
  onExitControlChange,
  onMicControlChange,
  onPublisherRoomChange,
  username
}: StudioPreviewPanelProps) {
  const [isSecondTriggerBlockActive, setIsSecondTriggerBlockActive] = useState(false);
  const [hasVisibleStartSuccessFeedback, setHasVisibleStartSuccessFeedback] =
    useState(false);
  const [visibleSuccessToken, setVisibleSuccessToken] = useState(0);
  const hasSecondTriggerBlockSeenStartProgressRef = useRef(false);
  const lastConsumedStartSuccessSequenceRef = useRef(0);
  const secondTriggerBlockResetTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSuccessFeedbackSyncTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSuccessFeedbackHideTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPublisherRoomChangeRef =
    useRef<StudioPreviewPanelProps["onPublisherRoomChange"]>(onPublisherRoomChange);
  const {
    canRetry,
    getPreviewStream,
    isCameraSwitchPending,
    isInitialBootstrapPending,
    previewState,
    retryPreview,
    switchPreviewCamera,
    videoRef
  } = useStudioPreviewBootstrap();
  const {
    canStart,
    effectiveLifecycleKind,
    getPublisherRoom,
    isStarting,
    isStopping,
    lifecycleMessage,
    publisherRoom,
    reportStartError,
    startSuccessSequence,
    startPublishing,
    stopPublishing
  } = useStudioPublishFoundation({
    lifecycleKind: lifecycle.kind,
    previewState,
    readPreviewStream: getPreviewStream
  });
  const { captureMicStartSnapshot, micControl } = useStudioMicUtilitySurface({
    effectiveLifecycleKind,
    getPreviewStream,
    getPublisherRoom,
    isStarting,
    isStopping,
    previewState
  });
  const [initialStartSuccessSequence] = useState(startSuccessSequence);
  const isHealthyPreview = previewState === "preview_ready";
  const isInitialRequestFlashSuppressed =
    isInitialBootstrapPending && previewState === "requesting";
  const usesSceneLayout = isHealthyPreview || isInitialRequestFlashSuppressed;
  const shouldShowRequestFallback = !isHealthyPreview && !isInitialRequestFlashSuppressed;
  const isEntryControlVisible = effectiveLifecycleKind !== "live";
  const isEntryActionPending = isStarting || isSecondTriggerBlockActive;
  const mediaFitMode = isHealthyPreview ? "canonical-fill" : "fallback-contain";
  const isLiveCameraControlAvailable =
    effectiveLifecycleKind === "live" && publisherRoom !== null;
  const isCameraControlAvailable =
    previewState === "preview_ready" &&
    (effectiveLifecycleKind !== "live" || isLiveCameraControlAvailable) &&
    !isStarting &&
    !isStopping;
  const shouldShowSuccessFeedback =
    isHealthyPreview &&
    hasVisibleStartSuccessFeedback &&
    visibleSuccessToken === startSuccessSequence;
  const shouldShowSupportStack =
    !isInitialRequestFlashSuppressed && (!isHealthyPreview || canRetry);
  const previewFrameRef = useStudioPreviewMediaPolish({
    enabled: previewState === "preview_ready",
    videoRef
  });
  const {
    isPublishedCameraSwitchPending,
    switchPublishedCamera
  } = useStudioPublishedCameraSwitch({
    getPublisherRoom,
    switchPreviewCamera
  });
  const handleCameraToggle = useCallback(() => {
    if (effectiveLifecycleKind === "live") {
      void switchPublishedCamera();
      return;
    }

    void switchPreviewCamera();
  }, [effectiveLifecycleKind, switchPreviewCamera, switchPublishedCamera]);
  const cameraControl = useMemo<StudioCameraControl | null>(() => {
    if (!isCameraControlAvailable) {
      return null;
    }

    return {
      isAvailable: true,
      isPending: isCameraSwitchPending || isPublishedCameraSwitchPending,
      onToggle: handleCameraToggle
    };
  }, [
    handleCameraToggle,
    isCameraControlAvailable,
    isCameraSwitchPending,
    isPublishedCameraSwitchPending
  ]);

  const clearSecondTriggerBlockResetTimeout = useCallback(() => {
    if (!secondTriggerBlockResetTimeoutRef.current) {
      return;
    }

    clearTimeout(secondTriggerBlockResetTimeoutRef.current);
    secondTriggerBlockResetTimeoutRef.current = null;
  }, []);

  const clearStartSuccessFeedbackSyncTimeout = useCallback(() => {
    if (!startSuccessFeedbackSyncTimeoutRef.current) {
      return;
    }

    clearTimeout(startSuccessFeedbackSyncTimeoutRef.current);
    startSuccessFeedbackSyncTimeoutRef.current = null;
  }, []);

  const clearStartSuccessFeedbackHideTimeout = useCallback(() => {
    if (!startSuccessFeedbackHideTimeoutRef.current) {
      return;
    }

    clearTimeout(startSuccessFeedbackHideTimeoutRef.current);
    startSuccessFeedbackHideTimeoutRef.current = null;
  }, []);

  const hideStartSuccessFeedback = useCallback(
    (token: number, visibleUntil: number) => {
      clearStartSuccessFeedbackHideTimeout();
      startSuccessFeedbackSnapshot = {
        isVisible: false,
        token,
        visibleUntil
      };
      setHasVisibleStartSuccessFeedback(false);
      setVisibleSuccessToken(token);
    },
    [clearStartSuccessFeedbackHideTimeout]
  );

  const showStartSuccessFeedbackWindow = useCallback(
    (token: number, visibleUntil: number) => {
      cancelStartSuccessFeedbackDeferredClear();
      clearStartSuccessFeedbackHideTimeout();
      startSuccessFeedbackSnapshot = {
        isVisible: true,
        token,
        visibleUntil
      };
      setVisibleSuccessToken(token);
      setHasVisibleStartSuccessFeedback(true);

      const remainingDuration = Math.max(visibleUntil - Date.now(), 0);

      if (remainingDuration === 0) {
        hideStartSuccessFeedback(token, visibleUntil);
        return;
      }

      startSuccessFeedbackHideTimeoutRef.current = setTimeout(() => {
        hideStartSuccessFeedback(token, visibleUntil);
      }, remainingDuration);
    },
    [clearStartSuccessFeedbackHideTimeout, hideStartSuccessFeedback]
  );

  useEffect(() => {
    if (isSecondTriggerBlockActive && (isStarting || effectiveLifecycleKind === "live")) {
      hasSecondTriggerBlockSeenStartProgressRef.current = true;
    }

    const shouldResetSecondTriggerBlock =
      isSecondTriggerBlockActive &&
      hasSecondTriggerBlockSeenStartProgressRef.current &&
      !isStarting &&
      effectiveLifecycleKind !== "live";

    if (!shouldResetSecondTriggerBlock) {
      clearSecondTriggerBlockResetTimeout();
      return;
    }

    if (secondTriggerBlockResetTimeoutRef.current) {
      return;
    }

    secondTriggerBlockResetTimeoutRef.current = setTimeout(() => {
      secondTriggerBlockResetTimeoutRef.current = null;
      hasSecondTriggerBlockSeenStartProgressRef.current = false;
      setIsSecondTriggerBlockActive(false);
    }, 0);
  }, [
    clearSecondTriggerBlockResetTimeout,
    effectiveLifecycleKind,
    isSecondTriggerBlockActive,
    isStarting
  ]);

  useEffect(() => {
    cancelStartSuccessFeedbackDeferredClear();
    clearStartSuccessFeedbackSyncTimeout();

    if (hasActiveStartSuccessFeedbackSnapshot(initialStartSuccessSequence)) {
      startSuccessFeedbackSyncTimeoutRef.current = setTimeout(() => {
        startSuccessFeedbackSyncTimeoutRef.current = null;
        showStartSuccessFeedbackWindow(
          initialStartSuccessSequence,
          startSuccessFeedbackSnapshot.visibleUntil
        );
      }, 0);
    }

    lastConsumedStartSuccessSequenceRef.current = initialStartSuccessSequence;

    return () => {
      clearSecondTriggerBlockResetTimeout();
      clearStartSuccessFeedbackHideTimeout();
      clearStartSuccessFeedbackSyncTimeout();
      scheduleStartSuccessFeedbackDeferredClear();
    };
  }, [
    clearSecondTriggerBlockResetTimeout,
    clearStartSuccessFeedbackHideTimeout,
    clearStartSuccessFeedbackSyncTimeout,
    initialStartSuccessSequence,
    showStartSuccessFeedbackWindow
  ]);

  useEffect(() => {
    if (
      startSuccessSequence <= lastConsumedStartSuccessSequenceRef.current ||
      hasActiveStartSuccessFeedbackSnapshot(startSuccessSequence)
    ) {
      return;
    }

    lastConsumedStartSuccessSequenceRef.current = startSuccessSequence;
    clearStartSuccessFeedbackSyncTimeout();
    startSuccessFeedbackSyncTimeoutRef.current = setTimeout(() => {
      startSuccessFeedbackSyncTimeoutRef.current = null;
      showStartSuccessFeedbackWindow(
        startSuccessSequence,
        Date.now() + START_SUCCESS_FEEDBACK_DURATION_MS
      );
    }, 0);
  }, [
    clearStartSuccessFeedbackSyncTimeout,
    showStartSuccessFeedbackWindow,
    startSuccessSequence
  ]);

  const lifecycleActions =
    !isInitialRequestFlashSuppressed && isEntryControlVisible ? (
      <StudioLifecycleActions
        canStart={canStart}
        isStarting={isEntryActionPending}
        message={lifecycleMessage}
        onStart={() => {
          if (isSecondTriggerBlockActive) {
            return;
          }

          const startSnapshot = captureMicStartSnapshot();

          if (!startSnapshot) {
            reportStartError();
            return;
          }

          hasSecondTriggerBlockSeenStartProgressRef.current = false;
          setIsSecondTriggerBlockActive(true);
          void startPublishing({
            initialMicMuted: startSnapshot.initialMicMuted
          });
        }}
        presentation={isHealthyPreview ? "scene-native" : "fallback"}
      />
    ) : null;

  useEffect(() => {
    if (!onExitControlChange) {
      return;
    }

    onExitControlChange({
      effectiveLifecycleKind,
      isStopping,
      lifecycleMessage,
      requestStopForExit: stopPublishing
    });
  }, [
    effectiveLifecycleKind,
    isStopping,
    lifecycleMessage,
    onExitControlChange,
    stopPublishing
  ]);

  useEffect(() => {
    if (!onMicControlChange) {
      return;
    }

    onMicControlChange(micControl);
  }, [micControl, onMicControlChange]);

  useEffect(() => {
    onCameraControlChange?.(cameraControl);
  }, [cameraControl, onCameraControlChange]);

  useEffect(() => {
    onPublisherRoomChangeRef.current = onPublisherRoomChange;
  }, [onPublisherRoomChange]);

  useEffect(() => {
    onPublisherRoomChange?.(publisherRoom);
  }, [onPublisherRoomChange, publisherRoom]);

  useEffect(() => {
    if (!onMicControlChange) {
      return;
    }

    return () => {
      onMicControlChange(null);
    };
  }, [onMicControlChange]);

  useEffect(() => {
    if (!onCameraControlChange) {
      return;
    }

    return () => {
      onCameraControlChange(null);
    };
  }, [onCameraControlChange]);

  useEffect(() => {
    return () => {
      onPublisherRoomChangeRef.current?.(null);
    };
  }, []);

  return (
    <StudioPreviewScene
      canRetry={canRetry}
      effectiveLifecycleKind={effectiveLifecycleKind}
      isHealthyPreview={isHealthyPreview}
      isInitialRequestFlashSuppressed={isInitialRequestFlashSuppressed}
      isStarting={isStarting}
      isStopping={isStopping}
      lifecycleActions={lifecycleActions}
      mediaFitMode={mediaFitMode}
      onRetryPreview={() => {
        void retryPreview();
      }}
      previewFrameRef={previewFrameRef}
      previewState={previewState}
      publisherRoom={publisherRoom}
      shouldShowRequestFallback={shouldShowRequestFallback}
      shouldShowSuccessFeedback={shouldShowSuccessFeedback}
      shouldShowSupportStack={shouldShowSupportStack}
      username={username}
      usesSceneLayout={usesSceneLayout}
      videoRef={videoRef}
    />
  );
}
