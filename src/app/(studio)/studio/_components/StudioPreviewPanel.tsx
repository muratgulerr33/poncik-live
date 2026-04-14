"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import { StudioLifecycleActions } from "./StudioLifecycleActions";
import { StudioPermissionNotice } from "./StudioPermissionNotice";
import { useStudioPublishFoundation } from "./useStudioPublishFoundation";
import { useStudioPreviewBootstrap } from "./useStudioPreviewBootstrap";
import styles from "./studio.module.css";

type StudioPreviewPanelProps = {
  lifecycle: {
    kind: "idle" | "live" | "degraded";
  };
};

export function StudioPreviewPanel({ lifecycle }: StudioPreviewPanelProps) {
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

  return (
    <section className={styles.previewScene}>
      <div className={styles.previewStageStack}>
        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>

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

          <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
        </div>
      </div>

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
      </div>
    </section>
  );
}
