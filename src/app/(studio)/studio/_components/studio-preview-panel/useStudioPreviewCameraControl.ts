"use client";

import type { Room } from "livekit-client";
import { useCallback, useMemo } from "react";

import type { StudioPreviewState } from "../../_adapters/studio-preview-adapter";
import type { StudioCameraControl } from "../StudioTopChrome";

type UseStudioPreviewCameraControlArgs = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isCameraSwitchPending: boolean;
  isPublishedCameraSwitchPending: boolean;
  isStarting: boolean;
  isStopping: boolean;
  previewState: StudioPreviewState;
  publisherRoom: Room | null;
  switchPreviewCamera: () => Promise<boolean>;
  switchPublishedCamera: () => Promise<boolean>;
}>;

export function useStudioPreviewCameraControl({
  effectiveLifecycleKind,
  isCameraSwitchPending,
  isPublishedCameraSwitchPending,
  isStarting,
  isStopping,
  previewState,
  publisherRoom,
  switchPreviewCamera,
  switchPublishedCamera
}: UseStudioPreviewCameraControlArgs): StudioCameraControl | null {
  const isLiveCameraControlAvailable =
    effectiveLifecycleKind === "live" && publisherRoom !== null;

  const isCameraControlAvailable =
    previewState === "preview_ready" &&
    (effectiveLifecycleKind !== "live" || isLiveCameraControlAvailable) &&
    !isStarting &&
    !isStopping;

  const handleCameraToggle = useCallback(() => {
    if (effectiveLifecycleKind === "live") {
      void switchPublishedCamera();
      return;
    }

    void switchPreviewCamera();
  }, [effectiveLifecycleKind, switchPreviewCamera, switchPublishedCamera]);

  return useMemo<StudioCameraControl | null>(() => {
    if (!isCameraControlAvailable) {
      return null;
    }

    return {
      isAvailable: true,
      isPending: isCameraSwitchPending || isPublishedCameraSwitchPending,
      onToggle: handleCameraToggle
    };
  }, [
    handleCameraToggle,
    isCameraControlAvailable,
    isCameraSwitchPending,
    isPublishedCameraSwitchPending
  ]);
}
