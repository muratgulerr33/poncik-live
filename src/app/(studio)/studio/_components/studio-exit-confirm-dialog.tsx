"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio.module.css";

type StudioExitConfirmDialogProps = {
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function StudioExitConfirmDialog({
  isPending,
  onCancel,
  onConfirm
}: StudioExitConfirmDialogProps) {
  return (
    <div className={styles.dialogBackdrop}>
      <div
        aria-labelledby="studio-exit-confirm-title"
        aria-modal="true"
        className={styles.dialogCard}
        role="dialog"
      >
        <h2 className={styles.dialogTitle} id="studio-exit-confirm-title">
          {STUDIO_COPY.exitConfirmTitle}
        </h2>

        <div className={styles.dialogActionRow}>
          <button
            className="ui-action ui-action-secondary"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            {STUDIO_COPY.exitConfirmCancelLabel}
          </button>

          <button
            className="ui-action ui-action-primary"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {STUDIO_COPY.exitConfirmConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
