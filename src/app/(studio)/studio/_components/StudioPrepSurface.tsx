"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  StudioPreviewPanel,
  type StudioExitControlState
} from "./StudioPreviewPanel";
import type { StudioLiveMicControl } from "./StudioTopChrome";
import { StudioExitConfirmDialog } from "./studio-exit-confirm-dialog";
import styles from "./studio-prep-surface.module.css";
import { StudioRouteShell } from "./studio-route-shell";

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
  const [liveMicControl, setLiveMicControl] = useState<StudioLiveMicControl | null>(
    null
  );

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
      closeDisabled={isExitPending || exitControl.isStopping}
      layout="scene"
      liveMicControl={liveMicControl}
      onRequestClose={handleRequestClose}
      surface="approved"
      username={username}
    >
      <section className={styles.prepScene} data-surface="approved">
        <StudioPreviewPanel
          lifecycle={lifecycle}
          onExitControlChange={setExitControl}
          onLiveMicControlChange={setLiveMicControl}
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
