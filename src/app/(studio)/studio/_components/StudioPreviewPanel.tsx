"use client";

import type { Room } from "livekit-client";

import { StudioLifecycleActions } from "./StudioLifecycleActions";
import type { StudioCameraControl, StudioMicControl } from "./StudioTopChrome";
import { useStudioPreviewCameraControl } from "./studio-preview-panel/useStudioPreviewCameraControl";
import { useStudioPreviewParentControls } from "./studio-preview-panel/useStudioPreviewParentControls";
import { StudioPreviewScene } from "./studio-preview-panel/StudioPreviewScene";
import { useStudioPreviewStartAction } from "./studio-preview-panel/useStudioPreviewStartAction";
import { useStudioStartSuccessFeedback } from "./studio-preview-panel/useStudioStartSuccessFeedback";
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

export function StudioPreviewPanel({
  lifecycle,
  onCameraControlChange,
  onExitControlChange,
  onMicControlChange,
  onPublisherRoomChange,
  username
}: StudioPreviewPanelProps) {
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
  const isHealthyPreview = previewState === "preview_ready";
  const isInitialRequestFlashSuppressed =
    isInitialBootstrapPending && previewState === "requesting";
  const usesSceneLayout = isHealthyPreview || isInitialRequestFlashSuppressed;
  const shouldShowRequestFallback = !isHealthyPreview && !isInitialRequestFlashSuppressed;
  const isEntryControlVisible = effectiveLifecycleKind !== "live";
  const mediaFitMode = isHealthyPreview ? "canonical-fill" : "fallback-contain";
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
  const cameraControl = useStudioPreviewCameraControl({
    effectiveLifecycleKind,
    isCameraSwitchPending,
    isPublishedCameraSwitchPending,
    isStarting,
    isStopping,
    previewState,
    publisherRoom,
    switchPreviewCamera,
    switchPublishedCamera
  });
  const {
    clearSecondTriggerBlockResetTimeout,
    handleStartPublishing,
    isStartActionPending
  } = useStudioPreviewStartAction({
    captureMicStartSnapshot,
    effectiveLifecycleKind,
    isStarting,
    reportStartError,
    startPublishing
  });

  const isStartSuccessFeedbackVisible = useStudioStartSuccessFeedback({
    clearSecondTriggerBlockResetTimeout,
    startSuccessSequence
  });
  const shouldShowSuccessFeedback =
    isHealthyPreview && isStartSuccessFeedbackVisible;

  const lifecycleActions =
    !isInitialRequestFlashSuppressed && isEntryControlVisible ? (
      <StudioLifecycleActions
        canStart={canStart}
        isStarting={isStartActionPending}
        message={lifecycleMessage}
        onStart={handleStartPublishing}
        presentation={isHealthyPreview ? "scene-native" : "fallback"}
      />
    ) : null;

  useStudioPreviewParentControls({
    cameraControl,
    effectiveLifecycleKind,
    isStopping,
    lifecycleMessage,
    micControl,
    onCameraControlChange,
    onExitControlChange,
    onMicControlChange,
    onPublisherRoomChange,
    publisherRoom,
    stopPublishing
  });

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
