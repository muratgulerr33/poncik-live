"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./live-watch.module.css";
import { useLiveWatchTransitionCoverContext } from "./live-watch-transition-cover-context";

const LONG_CONNECTION_FALLBACK_DELAY_MS = 12000;

export function LiveWatchTransitionCover() {
  const { isCoverVisible } = useLiveWatchTransitionCoverContext();
  const [isLongConnectionFallbackVisible, setIsLongConnectionFallbackVisible] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isCoverVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLongConnectionFallbackVisible(true);
    }, LONG_CONNECTION_FALLBACK_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      setIsLongConnectionFallbackVisible(false);
    };
  }, [isCoverVisible]);

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
        {isLongConnectionFallbackVisible ? (
          <>
            <p className={`t-body ${styles.transitionCopy}`}>Biraz uzun sürdü</p>
            <button
              className={styles.transitionCoverButton}
              onClick={() => {
                router.push("/");
              }}
              type="button"
            >
              Anasayfaya dön
            </button>
          </>
        ) : (
          <p className={`t-body ${styles.transitionCopy}`}>Canlı yayına bağlanıyor</p>
        )}
      </div>
    </div>
  );
}
