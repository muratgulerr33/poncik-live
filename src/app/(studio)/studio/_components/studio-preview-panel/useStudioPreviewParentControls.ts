"use client";

import type { Room } from "livekit-client";
import { useEffect, useRef } from "react";

import type {
  StudioCameraControl,
  StudioMicControl
} from "../StudioTopChrome";
import type { StudioExitControlState } from "../StudioPreviewPanel";

type UseStudioPreviewParentControlsArgs = Readonly<{
  cameraControl: StudioCameraControl | null;
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStopping: boolean;
  lifecycleMessage: string | null;
  micControl: StudioMicControl | null;
  onCameraControlChange?: (cameraControl: StudioCameraControl | null) => void;
  onExitControlChange?: (state: StudioExitControlState) => void;
  onMicControlChange?: (micControl: StudioMicControl | null) => void;
  onPublisherRoomChange?: (room: Room | null) => void;
  publisherRoom: Room | null;
  stopPublishing: () => Promise<boolean>;
}>;

export function useStudioPreviewParentControls({
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
}: UseStudioPreviewParentControlsArgs) {
  const onPublisherRoomChangeRef =
    useRef<UseStudioPreviewParentControlsArgs["onPublisherRoomChange"]>(
      onPublisherRoomChange
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

  useEffect(() => {
    if (!onMicControlChange) {
      return;
    }

    onMicControlChange(micControl);
  }, [micControl, onMicControlChange]);

  useEffect(() => {
    onCameraControlChange?.(cameraControl);
  }, [cameraControl, onCameraControlChange]);

  useEffect(() => {
    onPublisherRoomChangeRef.current = onPublisherRoomChange;
  }, [onPublisherRoomChange]);

  useEffect(() => {
    onPublisherRoomChange?.(publisherRoom);
  }, [onPublisherRoomChange, publisherRoom]);

  useEffect(() => {
    if (!onMicControlChange) {
      return;
    }

    return () => {
      onMicControlChange(null);
    };
  }, [onMicControlChange]);

  useEffect(() => {
    if (!onCameraControlChange) {
      return;
    }

    return () => {
      onCameraControlChange(null);
    };
  }, [onCameraControlChange]);

  useEffect(() => {
    return () => {
      onPublisherRoomChangeRef.current?.(null);
    };
  }, []);
}
