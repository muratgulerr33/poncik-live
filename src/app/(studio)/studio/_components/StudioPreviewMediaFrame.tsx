"use client";

import type { RefObject } from "react";

import { StudioPreviewMediaPolish } from "./StudioPreviewMediaPolish";
import styles from "./studio-preview-media-frame.module.css";

type StudioPreviewMediaFrameProps = {
  fitMode: "canonical-fill" | "fallback-contain";
  isVideoVisible: boolean;
  placeholder: string;
  previewFrameRef: RefObject<HTMLDivElement | null>;
  showPlaceholder: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function StudioPreviewMediaFrame({
  fitMode,
  isVideoVisible,
  placeholder,
  previewFrameRef,
  showPlaceholder,
  videoRef
}: StudioPreviewMediaFrameProps) {
  return (
    <div
      className={styles.frame}
      data-media-fit-mode={fitMode}
      ref={previewFrameRef}
    >
      <div className={styles.aperture}>
        <video
          className={isVideoVisible ? styles.video : styles.videoInactive}
          muted
          playsInline
          ref={videoRef}
        />
        {showPlaceholder ? (
          <div className={styles.placeholder}>{placeholder}</div>
        ) : null}
      </div>
      <StudioPreviewMediaPolish />
    </div>
  );
}
