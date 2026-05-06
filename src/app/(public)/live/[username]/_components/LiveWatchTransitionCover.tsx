"use client";

import styles from "./live-watch.module.css";
import { useLiveWatchTransitionCoverContext } from "./live-watch-transition-cover-context";

export function LiveWatchTransitionCover() {
  const { isCoverVisible } = useLiveWatchTransitionCoverContext();

  return (
    <div
      aria-atomic={isCoverVisible ? "true" : undefined}
      aria-hidden={!isCoverVisible}
      aria-live={isCoverVisible ? "polite" : undefined}
      className={styles.transitionCover}
      data-visible={isCoverVisible ? "true" : "false"}
      role={isCoverVisible ? "status" : undefined}
    >
      <div className={styles.transitionCoverInner}>
        <div className={styles.loadingPresence} aria-hidden="true">
          <span className={styles.loadingSpinner} />
        </div>
        <p className={`t-body ${styles.transitionCopy}`}>Canlı yayına bağlanıyor</p>
      </div>
    </div>
  );
}
