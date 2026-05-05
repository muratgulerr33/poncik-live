"use client";

import { Eye, Volume2, VolumeX, X } from "lucide-react";

import styles from "./live-watch-top-chrome.module.css";

type LiveWatchViewerCountMetric = Readonly<{
  accessibilityText: string;
  text: string;
}>;

type LiveWatchTopChromeProps = Readonly<{
  audioControl?: {
    enabled: boolean;
    isMuted: boolean;
    onToggleMuted: () => void;
  };
  onRequestClose: () => void;
  username: string;
  viewerCountMetric?: LiveWatchViewerCountMetric | null;
}>;

export function LiveWatchTopChrome({
  audioControl,
  onRequestClose,
  username,
  viewerCountMetric = null
}: LiveWatchTopChromeProps) {
  return (
    <header className={styles.chrome} aria-label="Canli yayin ust denetimleri">
      <div className={styles.leadingCluster}>
        <button
          aria-label="Canli yayini kapat"
          className={styles.closeButton}
          onClick={onRequestClose}
          type="button"
        >
          <X aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
        <p className={`t-label ${styles.usernameLabel}`}>@{username}</p>
      </div>
      {viewerCountMetric || audioControl?.enabled ? (
        <div className={styles.trailingCluster}>
          {viewerCountMetric ? (
            <p className={styles.viewerMetric}>
              <span className={styles.visuallyHidden}>{viewerCountMetric.accessibilityText}</span>
              <Eye
                aria-hidden="true"
                className={styles.viewerMetricIcon}
                size={15}
                strokeWidth={2}
              />
              <span aria-hidden="true" className={styles.viewerMetricCount}>
                {viewerCountMetric.text}
              </span>
            </p>
          ) : null}
          {audioControl?.enabled ? (
            <button
              aria-label={audioControl.isMuted ? "Sesi aç" : "Sesi kapat"}
              aria-pressed={audioControl.isMuted}
              className={styles.audioToggleButton}
              data-state={audioControl.isMuted ? "muted" : "active"}
              onClick={audioControl.onToggleMuted}
              type="button"
            >
              {audioControl.isMuted ? (
                <VolumeX aria-hidden="true" size={18} strokeWidth={2.2} />
              ) : (
                <Volume2 aria-hidden="true" size={18} strokeWidth={2.2} />
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
