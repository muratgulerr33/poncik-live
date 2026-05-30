"use client";

import type { Room } from "livekit-client";
import { useCallback, type ReactNode, type RefObject } from "react";

import type { StudioPreviewState } from "../../_adapters/studio-preview-adapter";
import { StudioLifecycleActions } from "../StudioLifecycleActions";
import type { StudioExitControlState } from "../StudioPreviewPanel";
import type { StudioCameraControl, StudioMicControl } from "../StudioTopChrome";
import { useStudioMicUtilitySurface } from "../useStudioMicUtilitySurface";
import { useStudioPreviewMediaPolish } from "../useStudioPreviewMediaPolish";
import { useStudioPreviewBootstrap } from "../useStudioPreviewBootstrap";
import { useStudioPublishedCameraSwitch } from "../useStudioPublishedCameraSwitch";
import { useStudioPublishFoundation } from "../useStudioPublishFoundation";
import { useStudioPreviewCameraControl } from "./useStudioPreviewCameraControl";
import { useStudioPreviewParentControls } from "./useStudioPreviewParentControls";
import { useStudioPreviewStartAction } from "./useStudioPreviewStartAction";
import { useStudioStartSuccessFeedback } from "./useStudioStartSuccessFeedback";

type StudioPreviewPanelModelArgs = Readonly<{
  lifecycle: {
    kind: "idle" | "live" | "degraded";
  };
  onCameraControlChange?: (cameraControl: StudioCameraControl | null) => void;
  onExitControlChange?: (state: StudioExitControlState) => void;
  onMicControlChange?: (micControl: StudioMicControl | null) => void;
  onPublisherRoomChange?: (room: Room | null) => void;
  username: string;
}>;

type StudioPreviewPanelSceneModel = Readonly<{
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

export function useStudioPreviewPanelModel({
  lifecycle,
  onCameraControlChange,
  onExitControlChange,
  onMicControlChange,
  onPublisherRoomChange,
  username
}: StudioPreviewPanelModelArgs): StudioPreviewPanelSceneModel {
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

  const handleRetryPreview = useCallback(() => {
    void retryPreview();
  }, [retryPreview]);

  return {
    canRetry,
    effectiveLifecycleKind,
    isHealthyPreview,
    isInitialRequestFlashSuppressed,
    isStarting,
    isStopping,
    lifecycleActions,
    mediaFitMode,
    onRetryPreview: handleRetryPreview,
    previewFrameRef,
    previewState,
    publisherRoom,
    shouldShowRequestFallback,
    shouldShowSuccessFeedback,
    shouldShowSupportStack,
    username,
    usesSceneLayout,
    videoRef
  };
}
