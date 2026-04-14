"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  StudioPreviewPanel,
  type StudioExitControlState
} from "./StudioPreviewPanel";
import { StudioExitConfirmDialog } from "./studio-exit-confirm-dialog";
import { StudioRouteShell } from "./studio-route-shell";
import styles from "./studio.module.css";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioPrepSurfaceProps = {
  lifecycle: {
    kind: "idle" | "live" | "degraded";
    broadcastId?: string;
  };
  statusLabel: string;
  statusTone: "idle" | "live" | "degraded";
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
  statusLabel,
  statusTone,
  username
}: StudioPrepSurfaceProps) {
  const router = useRouter();
  const [exitControl, setExitControl] = useState<StudioExitControlState>({
    ...DEFAULT_EXIT_CONTROL,
    effectiveLifecycleKind: lifecycle.kind
  });
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isExitPending, setIsExitPending] = useState(false);

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
      onRequestClose={handleRequestClose}
      statusLabel={statusLabel}
      statusTone={statusTone}
      username={username}
    >
      <section className={styles.prepScene}>
        <div className={styles.prepIntro}>
          <h2 className={styles.panelTitle}>{STUDIO_COPY.prepTitle}</h2>
          <p className={styles.panelDescription}>{STUDIO_COPY.prepBody}</p>
        </div>

        <StudioPreviewPanel
          lifecycle={lifecycle}
          onExitControlChange={setExitControl}
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
