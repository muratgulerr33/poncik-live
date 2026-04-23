"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LocalTrackPublication } from "livekit-client";

import type { StudioPublisherFacingMode } from "../_adapters/studio-livekit-publisher-adapter";
import { STUDIO_COPY } from "../_lib/studio-copy";
import { StudioLifecycleActions } from "./StudioLifecycleActions";
import type {
  StudioLiveCameraControl,
  StudioLiveMicControl
} from "./StudioTopChrome";
import { StudioPermissionNotice } from "./StudioPermissionNotice";
import { StudioStartFeedback } from "./StudioStartFeedback";
import styles from "./studio-preview-panel.module.css";
import {
  useStudioLiveCameraSwitchSurface,
  type StudioLiveCameraSwitchResult
} from "./useStudioLiveCameraSwitchSurface";
import { useStudioLiveMicUtilitySurface } from "./useStudioLiveMicUtilitySurface";
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
  onExitControlChange?: (state: StudioExitControlState) => void;
  onLiveCameraControlChange?: (
    liveCameraControl: StudioLiveCameraControl | null
  ) => void;
  onLiveMicControlChange?: (liveMicControl: StudioLiveMicControl | null) => void;
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

type StudioPreviewPanelCameraSwitchResult =
  | StudioLiveCameraSwitchResult
  | {
      kind: "guarded";
    };

type LiveCameraControlRelaySnapshot = Readonly<{
  isPending: boolean;
  onSwitch: StudioLiveCameraControl["onSwitch"];
}>;

function readTrackDeviceId(track: MediaStreamTrack | null | undefined) {
  const deviceId = track?.getSettings().deviceId;

  return typeof deviceId === "string" && deviceId.length > 0 ? deviceId : null;
}

function readCurrentLiveCameraAnchor(publication: LocalTrackPublication | null) {
  const sourceTrackDeviceId = publication?.videoTrack?.getSourceTrackSettings().deviceId;

  if (typeof sourceTrackDeviceId === "string" && sourceTrackDeviceId.length > 0) {
    return sourceTrackDeviceId;
  }

  return readTrackDeviceId(publication?.videoTrack?.mediaStreamTrack);
}

function readCurrentLiveFacingMode(
  publication: LocalTrackPublication | null
): StudioPublisherFacingMode | null {
  const sourceTrackFacingMode = publication?.videoTrack?.getSourceTrackSettings().facingMode;

  if (sourceTrackFacingMode === "user" || sourceTrackFacingMode === "environment") {
    return sourceTrackFacingMode;
  }

  const mediaTrackFacingMode = publication?.videoTrack?.mediaStreamTrack
    ?.getSettings()
    .facingMode;

  return mediaTrackFacingMode === "user" || mediaTrackFacingMode === "environment"
    ? mediaTrackFacingMode
    : null;
}

function readCurrentLiveSourceTrack(publication: LocalTrackPublication | null) {
  return publication?.videoTrack?.mediaStreamTrack ?? null;
}

function readCurrentPreviewCameraAnchor(stream: MediaStream | null) {
  return readTrackDeviceId(stream?.getVideoTracks()[0]);
}

function areEligibleCameraDeviceIdsEqual(
  previousDeviceIds: readonly string[],
  nextDeviceIds: readonly string[]
) {
  if (previousDeviceIds.length !== nextDeviceIds.length) {
    return false;
  }

  return previousDeviceIds.every((deviceId, index) => deviceId === nextDeviceIds[index]);
}

function toLiveCameraControlRelaySnapshot(
  liveCameraControl: StudioLiveCameraControl | null
): LiveCameraControlRelaySnapshot | null {
  if (!liveCameraControl) {
    return null;
  }

  return {
    isPending: liveCameraControl.isPending,
    onSwitch: liveCameraControl.onSwitch
  };
}

function areLiveCameraControlRelaySnapshotsEqual(
  previousSnapshot: LiveCameraControlRelaySnapshot | null,
  nextSnapshot: LiveCameraControlRelaySnapshot | null
) {
  if (previousSnapshot === nextSnapshot) {
    return true;
  }

  if (!previousSnapshot || !nextSnapshot) {
    return false;
  }

  return (
    previousSnapshot.isPending === nextSnapshot.isPending &&
    previousSnapshot.onSwitch === nextSnapshot.onSwitch
  );
}

function getNextEligibleCameraDeviceId(
  eligibleCameraDeviceIds: readonly string[],
  currentAnchorDeviceId: string | null
) {
  if (!currentAnchorDeviceId || eligibleCameraDeviceIds.length < 2) {
    return null;
  }

  const currentDeviceIndex = eligibleCameraDeviceIds.findIndex(
    (deviceId) => deviceId === currentAnchorDeviceId
  );

  if (currentDeviceIndex < 0) {
    return null;
  }

  return (
    eligibleCameraDeviceIds[
      (currentDeviceIndex + 1) % eligibleCameraDeviceIds.length
    ] ?? null
  );
}

async function readEligibleCameraDeviceIds() {
  if (
    typeof window === "undefined" ||
    !("mediaDevices" in navigator) ||
    typeof navigator.mediaDevices?.enumerateDevices !== "function"
  ) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices
    .filter(
      (device) => device.kind === "videoinput" && typeof device.deviceId === "string"
    )
    .map((device) => device.deviceId)
    .filter((deviceId) => deviceId.length > 0);
}

export function StudioPreviewPanel({
  lifecycle,
  onExitControlChange,
  onLiveCameraControlChange,
  onLiveMicControlChange
}: StudioPreviewPanelProps) {
  const [isSecondTriggerBlockActive, setIsSecondTriggerBlockActive] = useState(false);
  const [hasVisibleStartSuccessFeedback, setHasVisibleStartSuccessFeedback] =
    useState(false);
  const [visibleSuccessToken, setVisibleSuccessToken] = useState(0);
  const [eligibleCameraDeviceIds, setEligibleCameraDeviceIds] = useState<string[]>([]);
  const hasSecondTriggerBlockSeenStartProgressRef = useRef(false);
  const lastRelayedLiveCameraControlSnapshotRef =
    useRef<LiveCameraControlRelaySnapshot | null>(null);
  const lastConsumedStartSuccessSequenceRef = useRef(0);
  const secondTriggerBlockResetTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSuccessFeedbackSyncTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSuccessFeedbackHideTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    canRetry,
    getPreviewStream,
    isInitialBootstrapPending,
    previewState,
    releasePreviewVideoTrackForSwitch,
    replacePreviewVideoTrack,
    retryPreview,
    videoRef
  } =
    useStudioPreviewBootstrap();
  const {
    canStart,
    effectiveLifecycleKind,
    getPublisherRoom,
    isStarting,
    isStopping,
    lifecycleMessage,
    readActiveLiveVideoPublication,
    startSuccessSequence,
    startPublishing,
    stopPublishing,
    switchActiveLiveVideo
  } = useStudioPublishFoundation({
    lifecycleKind: lifecycle.kind,
    previewState,
    readPreviewStream: getPreviewStream
  });
  const { liveMicControl } = useStudioLiveMicUtilitySurface({
    effectiveLifecycleKind,
    getPublisherRoom
  });
  const liveEligibleCameraDeviceIds = useMemo(
    () => (effectiveLifecycleKind === "live" ? eligibleCameraDeviceIds : []),
    [effectiveLifecycleKind, eligibleCameraDeviceIds]
  );
  const currentLiveVideoPublication = readActiveLiveVideoPublication();
  const currentLiveFacingMode = readCurrentLiveFacingMode(currentLiveVideoPublication);
  const currentAnchorDeviceId =
    readCurrentLiveCameraAnchor(currentLiveVideoPublication) ??
    readCurrentPreviewCameraAnchor(getPreviewStream());
  const catchUpPreviewAfterSwitch = useCallback(async () => {
    const nextVideoTrack =
      readActiveLiveVideoPublication()?.videoTrack?.mediaStreamTrack ?? null;

    if (!nextVideoTrack) {
      return false;
    }

    return replacePreviewVideoTrack(nextVideoTrack);
  }, [readActiveLiveVideoPublication, replacePreviewVideoTrack]);
  const restorePreviewAfterFailedReverseSwitch = useCallback(
    async () => catchUpPreviewAfterSwitch(),
    [catchUpPreviewAfterSwitch]
  );
  const preparePreviewForReverseSwitch = useCallback(async () => {
    const previewTrack = getPreviewStream()?.getVideoTracks()[0] ?? null;
    const liveSourceTrack = readCurrentLiveSourceTrack(readActiveLiveVideoPublication());

    if (!previewTrack || !liveSourceTrack || previewTrack === liveSourceTrack) {
      return false;
    }

    return releasePreviewVideoTrackForSwitch();
  }, [
    getPreviewStream,
    readActiveLiveVideoPublication,
    releasePreviewVideoTrackForSwitch
  ]);
  const {
    isPending: isLiveCameraSwitchPending,
    switchCamera
  } = useStudioLiveCameraSwitchSurface({
    catchUpPreviewAfterSwitch,
    preparePreviewForReverseSwitch,
    restorePreviewAfterFailedReverseSwitch,
    switchActiveLiveVideo
  });
  const [initialStartSuccessSequence] = useState(startSuccessSequence);
  const isHealthyPreview = previewState === "preview_ready";
  const isInitialRequestFlashSuppressed =
    isInitialBootstrapPending && previewState === "requesting";
  const usesSceneLayout = isHealthyPreview || isInitialRequestFlashSuppressed;
  const shouldShowRequestFallback = !isHealthyPreview && !isInitialRequestFlashSuppressed;
  const isEntryControlVisible = effectiveLifecycleKind !== "live";
  const isEntryActionPending = isStarting || isSecondTriggerBlockActive;
  const shouldShowSuccessFeedback =
    isHealthyPreview &&
    hasVisibleStartSuccessFeedback &&
    visibleSuccessToken === startSuccessSequence;
  const shouldShowSupportStack =
    !isInitialRequestFlashSuppressed && (!isHealthyPreview || canRetry);
  const canRenderLiveCameraControl =
    effectiveLifecycleKind === "live" &&
    liveEligibleCameraDeviceIds.length >= 2 &&
    currentAnchorDeviceId !== null &&
    liveEligibleCameraDeviceIds.includes(currentAnchorDeviceId);

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

  const syncEligibleCameraDeviceIds = useCallback(async () => {
    const nextEligibleCameraDeviceIds = await readEligibleCameraDeviceIds();

    setEligibleCameraDeviceIds((previousEligibleCameraDeviceIds) =>
      areEligibleCameraDeviceIdsEqual(
        previousEligibleCameraDeviceIds,
        nextEligibleCameraDeviceIds
      )
        ? previousEligibleCameraDeviceIds
        : nextEligibleCameraDeviceIds
    );
  }, []);

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

  useEffect(() => {
    if (effectiveLifecycleKind !== "live") {
      return;
    }

    const syncTimeoutId = window.setTimeout(() => {
      void syncEligibleCameraDeviceIds();
    }, 0);

    if (
      typeof window === "undefined" ||
      !("mediaDevices" in navigator) ||
      typeof navigator.mediaDevices?.addEventListener !== "function"
    ) {
      return () => {
        window.clearTimeout(syncTimeoutId);
      };
    }

    function handleDeviceChange() {
      void syncEligibleCameraDeviceIds();
    }

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      window.clearTimeout(syncTimeoutId);
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [effectiveLifecycleKind, syncEligibleCameraDeviceIds]);

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

          hasSecondTriggerBlockSeenStartProgressRef.current = false;
          setIsSecondTriggerBlockActive(true);
          void startPublishing();
        }}
        presentation={isHealthyPreview ? "scene-native" : "fallback"}
      />
    ) : null;
  const runLiveCameraSwitchAttempt = useCallback(
    async (): Promise<StudioPreviewPanelCameraSwitchResult> => {
      if (effectiveLifecycleKind !== "live" || liveEligibleCameraDeviceIds.length < 2) {
        return {
          kind: "guarded"
        };
      }

      const nextDeviceId = getNextEligibleCameraDeviceId(
        liveEligibleCameraDeviceIds,
        currentAnchorDeviceId
      );

      if (!currentAnchorDeviceId || !nextDeviceId) {
        return {
          kind: "guarded"
        };
      }

      const preferredFacingMode: StudioPublisherFacingMode | null =
        liveEligibleCameraDeviceIds.length === 2 &&
        nextDeviceId !== currentAnchorDeviceId &&
        currentLiveFacingMode === "user"
          ? "environment"
          : liveEligibleCameraDeviceIds.length === 2 &&
              nextDeviceId !== currentAnchorDeviceId &&
              currentLiveFacingMode === "environment"
            ? "user"
            : null;

      return switchCamera({
        deviceId: nextDeviceId,
        preferredFacingMode
      });
    },
    [
      currentAnchorDeviceId,
      currentLiveFacingMode,
      effectiveLifecycleKind,
      liveEligibleCameraDeviceIds,
      switchCamera
    ]
  );
  const handleLiveCameraSwitch = useCallback(() => {
    void runLiveCameraSwitchAttempt();
  }, [runLiveCameraSwitchAttempt]);
  const liveCameraControl = useMemo<StudioLiveCameraControl | null>(() => {
    if (!canRenderLiveCameraControl) {
      return null;
    }

    return {
      isPending: isLiveCameraSwitchPending,
      onSwitch: handleLiveCameraSwitch
    };
  }, [canRenderLiveCameraControl, handleLiveCameraSwitch, isLiveCameraSwitchPending]);

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
    if (!onLiveCameraControlChange) {
      return;
    }

    const nextRelaySnapshot = toLiveCameraControlRelaySnapshot(liveCameraControl);

    if (
      areLiveCameraControlRelaySnapshotsEqual(
        lastRelayedLiveCameraControlSnapshotRef.current,
        nextRelaySnapshot
      )
    ) {
      return;
    }

    lastRelayedLiveCameraControlSnapshotRef.current = nextRelaySnapshot;
    onLiveCameraControlChange(liveCameraControl);
  }, [liveCameraControl, onLiveCameraControlChange]);

  useEffect(() => {
    if (!onLiveCameraControlChange) {
      return;
    }

    return () => {
      lastRelayedLiveCameraControlSnapshotRef.current = null;
      onLiveCameraControlChange(null);
    };
  }, [onLiveCameraControlChange]);

  useEffect(() => {
    if (!onLiveMicControlChange) {
      return;
    }

    onLiveMicControlChange(liveMicControl);
  }, [liveMicControl, onLiveMicControlChange]);

  useEffect(() => {
    if (!onLiveMicControlChange) {
      return;
    }

    return () => {
      onLiveMicControlChange(null);
    };
  }, [onLiveMicControlChange]);

  return (
    <section
      className={styles.previewScene}
      data-host-contract={isInitialRequestFlashSuppressed ? "initial-scene" : undefined}
      data-state={previewState}
      data-surface="approved"
    >
      <div
        className={styles.previewStageStack}
        data-host-contract={isInitialRequestFlashSuppressed ? "initial-scene" : undefined}
        data-layout={usesSceneLayout ? "scene" : "panel"}
        data-surface="approved"
      >
        <div
          className={usesSceneLayout ? styles.sceneMediaRoot : styles.previewCard}
          data-state={previewState}
        >
          {shouldShowRequestFallback ? (
            <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>
          ) : null}

          <div className={styles.previewFrame}>
            <video
              className={
                previewState === "preview_ready"
                  ? styles.previewVideo
                  : styles.previewVideoInactive
              }
              muted
              playsInline
              ref={videoRef}
            />
            {shouldShowRequestFallback ? (
              <div className={styles.previewPlaceholder}>
                {STUDIO_COPY.previewPlaceholder}
              </div>
            ) : null}
          </div>

          {shouldShowRequestFallback ? (
            <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
          ) : null}
        </div>

        {isHealthyPreview ? (
          <>
            <div className={styles.sceneSuccessFeedbackLane}>
              {shouldShowSuccessFeedback ? (
                <StudioStartFeedback
                  message={STUDIO_COPY.startBroadcastSuccessLabel}
                />
              ) : null}
            </div>

            <div className={styles.sceneActionSurface}>
              <div className={styles.sceneActionBudget}>{lifecycleActions}</div>
            </div>
          </>
        ) : (
          lifecycleActions
        )}
      </div>

      {shouldShowSupportStack ? (
        <div className={styles.sceneSupportStack}>
          <StudioPermissionNotice state={previewState} />

          {canRetry ? (
            <button
              className={`${styles.stackAction} ui-action ui-action-secondary`}
              onClick={() => {
                void retryPreview();
              }}
              type="button"
            >
              {STUDIO_COPY.retryPreviewLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
