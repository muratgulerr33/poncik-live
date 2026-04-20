"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio-preview-panel.module.css";

type StudioLifecycleActionsProps = {
  canStart: boolean;
  isStarting: boolean;
  message: string | null;
  onStart: () => void;
};

export function StudioLifecycleActions({
  canStart,
  isStarting,
  message,
  onStart
}: StudioLifecycleActionsProps) {
  const actionLabel = isStarting
    ? STUDIO_COPY.startingBroadcastLabel
    : STUDIO_COPY.startBroadcastLabel;
  const isDisabled = !canStart || isStarting;

  return (
    <div className={styles.lifecycleStack}>
      <div className={`${styles.actionRow} ${styles.lifecycleActionRow}`}>
        <button
          className={`ui-action ui-action-primary ${styles.lifecyclePrimaryAction}`}
          disabled={isDisabled}
          onClick={onStart}
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
