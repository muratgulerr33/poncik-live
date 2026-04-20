"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { STUDIO_COPY } from "../_lib/studio-copy";
import { StudioLifecycleActions } from "./StudioLifecycleActions";
import { StudioPermissionNotice } from "./StudioPermissionNotice";
import { useStudioPublishFoundation } from "./useStudioPublishFoundation";
import { useStudioPreviewBootstrap } from "./useStudioPreviewBootstrap";
import styles from "./studio.module.css";

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
};

type SecondTriggerBlockSnapshot = {
  hasSeenStartProgress: boolean;
  isActive: boolean;
};

function createSecondTriggerBlockStore() {
  let snapshot: SecondTriggerBlockSnapshot = {
    hasSeenStartProgress: false,
    isActive: false
  };
  const listeners = new Set<() => void>();

  const emitChange = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    activate() {
      snapshot = {
        hasSeenStartProgress: false,
        isActive: true
      };
      emitChange();
    },
    deactivate() {
      if (!snapshot.isActive) {
        return;
      }

      snapshot = {
        hasSeenStartProgress: false,
        isActive: false
      };
      emitChange();
    },
    getSnapshot() {
      return snapshot;
    },
    markStartProgressSeen() {
      if (!snapshot.isActive || snapshot.hasSeenStartProgress) {
        return;
      }

      snapshot = {
        ...snapshot,
        hasSeenStartProgress: true
      };
      emitChange();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  };
}

export function StudioPreviewPanel({
  lifecycle,
  onExitControlChange
}: StudioPreviewPanelProps) {
  const [secondTriggerBlockStore] = useState(createSecondTriggerBlockStore);
  const {
    canRetry,
    getPreviewStream,
    previewState,
    retryPreview,
    videoRef
  } =
    useStudioPreviewBootstrap();
  const {
    canStart,
    effectiveLifecycleKind,
    isStarting,
    isStopping,
    lifecycleMessage,
    startPublishing,
    stopPublishing
  } = useStudioPublishFoundation({
    lifecycleKind: lifecycle.kind,
    previewState,
    readPreviewStream: getPreviewStream
  });
  const secondTriggerBlockSnapshot = useSyncExternalStore(
    secondTriggerBlockStore.subscribe,
    secondTriggerBlockStore.getSnapshot
  );
  const isHealthyPreview = previewState === "preview_ready";
  const isEntryControlVisible = effectiveLifecycleKind !== "live";
  const isSecondTriggerBlockActive = secondTriggerBlockSnapshot.isActive;
  const isEntryActionPending = isStarting || isSecondTriggerBlockActive;
  const shouldShowSupportStack = !isHealthyPreview || canRetry;

  useEffect(() => {
    if (isSecondTriggerBlockActive && (isStarting || effectiveLifecycleKind === "live")) {
      secondTriggerBlockStore.markStartProgressSeen();
    }

    if (
      isSecondTriggerBlockActive &&
      secondTriggerBlockSnapshot.hasSeenStartProgress &&
      !isStarting &&
      effectiveLifecycleKind !== "live"
    ) {
      secondTriggerBlockStore.deactivate();
    }
  }, [
    effectiveLifecycleKind,
    isSecondTriggerBlockActive,
    isStarting,
    secondTriggerBlockSnapshot.hasSeenStartProgress,
    secondTriggerBlockStore
  ]);

  const lifecycleActions = isEntryControlVisible ? (
    <StudioLifecycleActions
      canStart={canStart}
      isStarting={isEntryActionPending}
      message={lifecycleMessage}
      onStart={() => {
        if (isSecondTriggerBlockActive) {
          return;
        }

        secondTriggerBlockStore.activate();
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

  return (
    <section className={styles.previewScene} data-state={previewState}>
      <div
        className={styles.previewStageStack}
        data-layout={isHealthyPreview ? "scene" : "panel"}
      >
        <div
          className={isHealthyPreview ? styles.sceneMediaRoot : styles.previewCard}
          data-state={previewState}
        >
          {isHealthyPreview ? null : (
            <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>
          )}

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
            {previewState === "preview_ready" ? null : (
              <div className={styles.previewPlaceholder}>
                {STUDIO_COPY.previewPlaceholder}
              </div>
            )}
          </div>

          {isHealthyPreview ? null : (
            <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
          )}
        </div>

        {isHealthyPreview ? (
          <div className={styles.sceneActionSurface}>
            <div className={styles.sceneActionBudget}>{lifecycleActions}</div>
          </div>
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
