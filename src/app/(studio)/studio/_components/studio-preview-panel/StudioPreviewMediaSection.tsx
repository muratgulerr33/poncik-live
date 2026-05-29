"use client";

import type { RefObject } from "react";

import type { StudioPreviewState } from "../../_adapters/studio-preview-adapter";
import { STUDIO_COPY } from "../../_lib/studio-copy";
import { StudioPreviewMediaFrame } from "../StudioPreviewMediaFrame";
import styles from "../studio-preview-panel.module.css";

type StudioPreviewMediaSectionProps = Readonly<{
  mediaFitMode: "canonical-fill" | "fallback-contain";
  previewFrameRef: RefObject<HTMLDivElement | null>;
  previewState: StudioPreviewState;
  shouldShowRequestFallback: boolean;
  usesSceneLayout: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

export function StudioPreviewMediaSection({
  mediaFitMode,
  previewFrameRef,
  previewState,
  shouldShowRequestFallback,
  usesSceneLayout,
  videoRef
}: StudioPreviewMediaSectionProps) {
  return (
    <div
      className={usesSceneLayout ? styles.sceneMediaRoot : styles.previewCard}
      data-state={previewState}
    >
      {shouldShowRequestFallback ? (
        <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>
      ) : null}

      <StudioPreviewMediaFrame
        fitMode={mediaFitMode}
        isVideoVisible={previewState === "preview_ready"}
        placeholder={STUDIO_COPY.previewPlaceholder}
        previewFrameRef={previewFrameRef}
        showPlaceholder={shouldShowRequestFallback}
        videoRef={videoRef}
      />

      {shouldShowRequestFallback ? (
        <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
      ) : null}
    </div>
  );
}
