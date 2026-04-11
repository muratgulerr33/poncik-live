"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio.module.css";

type StudioLifecycleActionsProps = {
  canStart: boolean;
  canStop: boolean;
  isStarting: boolean;
  isStopping: boolean;
  message: string | null;
  onStart: () => void;
  onStop: () => void;
};

export function StudioLifecycleActions({
  canStart,
  canStop,
  isStarting,
  isStopping,
  message,
  onStart,
  onStop
}: StudioLifecycleActionsProps) {
  const isPending = isStarting || isStopping;

  return (
    <div className={styles.lifecycleStack}>
      <div className={styles.actionRow}>
        <button
          className={styles.primaryAction}
          disabled={!canStart || isPending}
          onClick={onStart}
          type="button"
        >
          {isStarting ? STUDIO_COPY.startingBroadcastLabel : STUDIO_COPY.startBroadcastLabel}
        </button>

        <button
          className={styles.secondaryAction}
          disabled={!canStop || isPending}
          onClick={onStop}
          type="button"
        >
          {isStopping ? STUDIO_COPY.stoppingBroadcastLabel : STUDIO_COPY.stopBroadcastLabel}
        </button>
      </div>

      {message ? <p className={styles.errorText}>{message}</p> : null}
    </div>
  );
}
