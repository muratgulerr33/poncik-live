"use client";

import { useEffect } from "react";

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

export function StudioPreviewPanel({
  lifecycle,
  onExitControlChange
}: StudioPreviewPanelProps) {
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
    canStop,
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
  const isHealthyPreview = previewState === "preview_ready";
  const shouldShowSupportStack = !isHealthyPreview || canRetry;
  const lifecycleActions = (
    <StudioLifecycleActions
      canStart={canStart}
      canStop={canStop}
      isStarting={isStarting}
      isStopping={isStopping}
      message={lifecycleMessage}
      onStart={() => {
        void startPublishing();
      }}
      onStop={() => {
        void stopPublishing();
      }}
    />
  );

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
