"use client";

import { X } from "lucide-react";

import styles from "./live-watch-top-chrome.module.css";

type LiveWatchTopChromeProps = Readonly<{
  onRequestClose: () => void;
  username: string;
}>;

export function LiveWatchTopChrome({
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
    </header>
  );
}
