import { X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

type StudioTopChromeProps = Readonly<{
  closeDisabled?: boolean;
  onRequestClose: () => void;
  username?: string;
}>;

export function StudioTopChrome({
  closeDisabled = false,
  onRequestClose,
  username
}: StudioTopChromeProps) {
  return (
    <header
      className={styles.chrome}
      data-layout="scene"
      data-surface="approved"
      aria-label="Studyo ust denetimleri"
    >
      <div className={styles.leadingCluster}>
        <button
          aria-label="Studyo sahnesinden cik"
          className={styles.closeButton}
          disabled={closeDisabled}
          onClick={onRequestClose}
          type="button"
        >
          <X aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
        {username ? (
          <p className={`t-label ${styles.usernameLabel}`}>@{username}</p>
        ) : null}
      </div>
    </header>
  );
}
