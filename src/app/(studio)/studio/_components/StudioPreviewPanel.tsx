"use client";

import type { Room } from "livekit-client";

import type { StudioCameraControl, StudioMicControl } from "./StudioTopChrome";
import { StudioPreviewScene } from "./studio-preview-panel/StudioPreviewScene";
import { useStudioPreviewPanelModel } from "./studio-preview-panel/useStudioPreviewPanelModel";

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
  const sceneModel = useStudioPreviewPanelModel({
    lifecycle,
    onCameraControlChange,
    onExitControlChange,
    onMicControlChange,
    onPublisherRoomChange,
    username
  });

  return <StudioPreviewScene {...sceneModel} />;
}
