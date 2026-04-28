"use client";

import { Check } from "lucide-react";
import type { AnimationEvent } from "react";

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
  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (
      phase !== "exiting" ||
      !onExitComplete ||
      event.target !== event.currentTarget
    ) {
      return;
    }

    if (event.animationName !== "liveWatchSurfaceNoticeOut") {
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
        onAnimationEnd={handleAnimationEnd}
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
