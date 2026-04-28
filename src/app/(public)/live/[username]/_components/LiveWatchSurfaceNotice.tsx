"use client";

import { Check } from "lucide-react";
import type { TransitionEvent } from "react";

import styles from "./live-watch-surface-notice.module.css";

type LiveWatchSurfaceNoticeProps = Readonly<{
  message: string;
  onExitComplete?: () => void;
  phase: "visible" | "exiting";
  tone: "success";
}>;

export function LiveWatchSurfaceNotice({
  message,
  onExitComplete,
  phase,
  tone
}: LiveWatchSurfaceNoticeProps) {
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (!onExitComplete || event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== "opacity" && event.propertyName !== "transform") {
      return;
    }

    onExitComplete();
  }

  return (
    <div className={styles.noticeLayer}>
      <div
        aria-atomic="true"
        aria-live="polite"
        className={styles.noticePill}
        data-phase={phase}
        data-tone={tone}
        onTransitionEnd={onExitComplete ? handleTransitionEnd : undefined}
        role="status"
      >
        <span aria-hidden="true" className={styles.noticeIndicator}>
          <Check size={12} strokeWidth={2.7} />
        </span>
        <span className={`t-body ${styles.noticeMessage}`}>{message}</span>
      </div>
    </div>
  );
}
