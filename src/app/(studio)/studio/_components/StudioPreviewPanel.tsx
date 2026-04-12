"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import { StudioFreshness } from "./StudioFreshness";
import { StudioLifecycleActions } from "./StudioLifecycleActions";
import { StudioPermissionNotice } from "./StudioPermissionNotice";
import { useStudioPublishFoundation } from "./useStudioPublishFoundation";
import { useStudioPreviewBootstrap } from "./useStudioPreviewBootstrap";
import styles from "./studio.module.css";

type StudioPreviewPanelProps = {
  username: string;
  lifecycle: {
    kind: "idle" | "live" | "degraded";
  };
};

function getLifecycleLabel(kind: StudioPreviewPanelProps["lifecycle"]["kind"]) {
  if (kind === "live") {
    return STUDIO_COPY.liveLifecycleLabel;
  }

  if (kind === "degraded") {
    return STUDIO_COPY.degradedLifecycleLabel;
  }

  return STUDIO_COPY.idleLifecycleLabel;
}

export function StudioPreviewPanel({
  username,
  lifecycle
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

  return (
    <div className={styles.prepStack}>
      {previewState !== "requesting" ? <StudioFreshness /> : null}

      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <div>
            <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>
            <h3 className={styles.previewTitle}>{username}</h3>
          </div>
          <span className={styles.lifecycleBadge}>
            {getLifecycleLabel(effectiveLifecycleKind)}
          </span>
        </div>

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
            <div className={styles.previewPlaceholder}>{STUDIO_COPY.previewPlaceholder}</div>
          )}
        </div>

        <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
      </div>

      <StudioPermissionNotice state={previewState} />

      {canRetry ? (
        <button
          className={styles.secondaryAction}
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
  );
}
