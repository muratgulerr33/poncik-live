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
  const shouldShowStopAction = canStop || isStopping;
  const actionLabel = shouldShowStopAction
    ? isStopping
      ? STUDIO_COPY.stoppingBroadcastLabel
      : STUDIO_COPY.stopBroadcastLabel
    : isStarting
      ? STUDIO_COPY.startingBroadcastLabel
      : STUDIO_COPY.startBroadcastLabel;
  const isDisabled = shouldShowStopAction
    ? !canStop || isPending
    : !canStart || isPending;

  return (
    <div className={styles.lifecycleStack}>
      <div className={`${styles.actionRow} ${styles.lifecycleActionRow}`}>
        <button
          className={`ui-action ui-action-primary ${styles.lifecyclePrimaryAction}`}
          disabled={isDisabled}
          onClick={shouldShowStopAction ? onStop : onStart}
          type="button"
        >
          {actionLabel}
        </button>
      </div>

      {message ? (
        <p className={`${styles.errorText} ${styles.lifecycleMessage}`}>{message}</p>
      ) : null}
    </div>
  );
}
