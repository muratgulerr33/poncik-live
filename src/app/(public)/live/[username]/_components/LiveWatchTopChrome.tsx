"use client";

import { Volume2, VolumeX, X } from "lucide-react";

import styles from "./live-watch-top-chrome.module.css";

type LiveWatchTopChromeProps = Readonly<{
  audioControl?: {
    enabled: boolean;
    isMuted: boolean;
    onToggleMuted: () => void;
  };
  onRequestClose: () => void;
  username: string;
}>;

export function LiveWatchTopChrome({
  audioControl,
  onRequestClose,
  username
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
      {audioControl?.enabled ? (
        <div className={styles.trailingCluster}>
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
        </div>
      ) : null}
    </header>
  );
}
