"use client";

import type { Room } from "livekit-client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  StudioPreviewPanel,
  type StudioExitControlState
} from "./StudioPreviewPanel";
import {
  type StudioCameraControl,
  type StudioMicControl,
  type StudioViewerCountMetric
} from "./StudioTopChrome";
import { StudioExitConfirmDialog } from "./studio-exit-confirm-dialog";
import styles from "./studio-prep-surface.module.css";
import { StudioRouteShell } from "./studio-route-shell";
import { useStudioViewerCountMetric } from "./useStudioViewerCountMetric";

type StudioPrepSurfaceProps = {
  lifecycle: {
    kind: "idle" | "live" | "degraded";
    broadcastId?: string;
  };
  username: string;
};

const DEFAULT_EXIT_CONTROL: StudioExitControlState = {
  effectiveLifecycleKind: "idle",
  isStopping: false,
  lifecycleMessage: null,
  requestStopForExit: async () => false
};

export function StudioPrepSurface({
  lifecycle,
  username
}: StudioPrepSurfaceProps) {
  const router = useRouter();
  const [exitControl, setExitControl] = useState<StudioExitControlState>({
    ...DEFAULT_EXIT_CONTROL,
    effectiveLifecycleKind: lifecycle.kind
  });
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isExitPending, setIsExitPending] = useState(false);
  const [cameraControl, setCameraControl] = useState<StudioCameraControl | null>(null);
  const [micControl, setMicControl] = useState<StudioMicControl | null>(null);
  const [publisherRoom, setPublisherRoom] = useState<Room | null>(null);
  const viewerCount = useStudioViewerCountMetric(publisherRoom);
  const viewerCountMetric = useMemo<StudioViewerCountMetric | null>(() => {
    if (
      exitControl.effectiveLifecycleKind !== "live" ||
      exitControl.isStopping ||
      viewerCount === null
    ) {
      return null;
    }

    const text = String(viewerCount);

    return {
      accessibilityText: `İzleyici sayısı: ${text}`,
      text
    };
  }, [exitControl.effectiveLifecycleKind, exitControl.isStopping, viewerCount]);

  const handleRequestClose = useCallback(() => {
    if (isExitPending || exitControl.isStopping) {
      return;
    }

    if (exitControl.effectiveLifecycleKind !== "live") {
      router.push("/");
      return;
    }

    setIsExitDialogOpen(true);
  }, [
    exitControl.effectiveLifecycleKind,
    exitControl.isStopping,
    isExitPending,
    router
  ]);

  const handleCancelExit = useCallback(() => {
    if (isExitPending) {
      return;
    }

    setIsExitDialogOpen(false);
  }, [isExitPending]);

  const handleConfirmExit = useCallback(async () => {
    if (isExitPending) {
      return;
    }

    setIsExitPending(true);

    const didStop = await exitControl.requestStopForExit();

    setIsExitPending(false);

    if (didStop) {
      setIsExitDialogOpen(false);
      router.push("/");
      return;
    }

    setIsExitDialogOpen(false);
  }, [exitControl, isExitPending, router]);

  return (
    <StudioRouteShell
      cameraControl={cameraControl}
      closeDisabled={isExitPending || exitControl.isStopping}
      layout="scene"
      micControl={micControl}
      onRequestClose={handleRequestClose}
      surface="approved"
      username={username}
      viewerCountMetric={viewerCountMetric}
    >
      <section className={styles.prepScene} data-surface="approved">
        <StudioPreviewPanel
          lifecycle={lifecycle}
          onCameraControlChange={setCameraControl}
          onExitControlChange={setExitControl}
          onMicControlChange={setMicControl}
          onPublisherRoomChange={setPublisherRoom}
          username={username}
        />
      </section>

      {isExitDialogOpen ? (
        <StudioExitConfirmDialog
          isPending={isExitPending}
          onCancel={handleCancelExit}
          onConfirm={() => {
            void handleConfirmExit();
          }}
        />
      ) : null}
    </StudioRouteShell>
  );
}
