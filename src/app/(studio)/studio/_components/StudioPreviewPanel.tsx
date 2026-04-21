"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { STUDIO_COPY } from "../_lib/studio-copy";
import { StudioLifecycleActions } from "./StudioLifecycleActions";
import type { StudioLiveMicControl } from "./StudioTopChrome";
import { StudioPermissionNotice } from "./StudioPermissionNotice";
import { StudioStartFeedback } from "./StudioStartFeedback";
import styles from "./studio-preview-panel.module.css";
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

export function StudioPreviewPanel({
  lifecycle,
  onExitControlChange,
  onLiveMicControlChange
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
  const {
    canRetry,
    getPreviewStream,
    isInitialBootstrapPending,
    previewState,
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
    startSuccessSequence,
    startPublishing,
    stopPublishing
  } = useStudioPublishFoundation({
    lifecycleKind: lifecycle.kind,
    previewState,
    readPreviewStream: getPreviewStream
  });
  const { liveMicControl } = useStudioLiveMicUtilitySurface({
    effectiveLifecycleKind,
    getPublisherRoom
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

          hasSecondTriggerBlockSeenStartProgressRef.current = false;
          setIsSecondTriggerBlockActive(true);
          void startPublishing();
        }}
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
