"use client";

import type { Room } from "livekit-client";
import type { ReactNode, RefObject } from "react";

import type { StudioPreviewState } from "../../_adapters/studio-preview-adapter";
import styles from "../studio-preview-panel.module.css";
import { StudioPreviewHealthyLayer } from "./StudioPreviewHealthyLayer";
import { StudioPreviewMediaSection } from "./StudioPreviewMediaSection";
import { StudioPreviewSupportStack } from "./StudioPreviewSupportStack";

type StudioPreviewSceneProps = Readonly<{
  canRetry: boolean;
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isHealthyPreview: boolean;
  isInitialRequestFlashSuppressed: boolean;
  isStarting: boolean;
  isStopping: boolean;
  lifecycleActions: ReactNode;
  mediaFitMode: "canonical-fill" | "fallback-contain";
  onRetryPreview: () => void;
  previewFrameRef: RefObject<HTMLDivElement | null>;
  previewState: StudioPreviewState;
  publisherRoom: Room | null;
  shouldShowRequestFallback: boolean;
  shouldShowSuccessFeedback: boolean;
  shouldShowSupportStack: boolean;
  username: string;
  usesSceneLayout: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

export function StudioPreviewScene({
  canRetry,
  effectiveLifecycleKind,
  isHealthyPreview,
  isInitialRequestFlashSuppressed,
  isStarting,
  isStopping,
  lifecycleActions,
  mediaFitMode,
  onRetryPreview,
  previewFrameRef,
  previewState,
  publisherRoom,
  shouldShowRequestFallback,
  shouldShowSuccessFeedback,
  shouldShowSupportStack,
  username,
  usesSceneLayout,
  videoRef
}: StudioPreviewSceneProps) {
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
        <StudioPreviewMediaSection
          mediaFitMode={mediaFitMode}
          previewFrameRef={previewFrameRef}
          previewState={previewState}
          shouldShowRequestFallback={shouldShowRequestFallback}
          usesSceneLayout={usesSceneLayout}
          videoRef={videoRef}
        />

        {isHealthyPreview ? (
          <StudioPreviewHealthyLayer
            effectiveLifecycleKind={effectiveLifecycleKind}
            isStarting={isStarting}
            isStopping={isStopping}
            lifecycleActions={lifecycleActions}
            publisherRoom={publisherRoom}
            shouldShowSuccessFeedback={shouldShowSuccessFeedback}
            username={username}
          />
        ) : (
          lifecycleActions
        )}
      </div>

      {shouldShowSupportStack ? (
        <StudioPreviewSupportStack
          canRetry={canRetry}
          onRetryPreview={onRetryPreview}
          previewState={previewState}
        />
      ) : null}
    </section>
  );
}
