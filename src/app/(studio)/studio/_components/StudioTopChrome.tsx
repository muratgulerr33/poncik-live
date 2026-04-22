import { Mic, MicOff, X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

export type StudioLiveMicControl = Readonly<{
  isMuted: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

type StudioTopChromeProps = Readonly<{
  closeDisabled?: boolean;
  liveMicControl?: StudioLiveMicControl | null;
  onRequestClose: () => void;
  username?: string;
}>;

export function StudioTopChrome({
  closeDisabled = false,
  liveMicControl = null,
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
      {liveMicControl ? (
        <div className={styles.trailingCluster}>
          <button
            aria-label={liveMicControl.isMuted ? "Mikrofonu ac" : "Mikrofonu kapat"}
            aria-pressed={liveMicControl.isMuted}
            className={styles.utilityButton}
            data-state={liveMicControl.isMuted ? "muted" : "active"}
            disabled={liveMicControl.isPending}
            onClick={liveMicControl.onToggle}
            type="button"
          >
            {liveMicControl.isMuted ? (
              <MicOff aria-hidden="true" size={18} strokeWidth={2.2} />
            ) : (
              <Mic aria-hidden="true" size={18} strokeWidth={2.2} />
            )}
          </button>
        </div>
      ) : null}
    </header>
  );
}
