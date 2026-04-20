"use client";

import styles from "./studio-start-feedback.module.css";

type StudioStartFeedbackProps = {
  message: string;
};

export function StudioStartFeedback({ message }: StudioStartFeedbackProps) {
  return (
    <div
      aria-live="polite"
      className={styles.startFeedback}
      role="status"
    >
      <span aria-hidden="true" className={styles.startFeedbackIndicator} />
      <span className={styles.startFeedbackMessage}>{message}</span>
    </div>
  );
}
