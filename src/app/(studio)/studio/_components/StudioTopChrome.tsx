import { Mic, MicOff, RefreshCw, X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

export type StudioLiveMicControl = Readonly<{
  isMuted: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

export type StudioLiveCameraSwitchControl = Readonly<{
  isPending: boolean;
  onSwitch: () => void;
}>;

type StudioTopChromeProps = Readonly<{
  closeDisabled?: boolean;
  liveCameraSwitchControl?: StudioLiveCameraSwitchControl | null;
  liveMicControl?: StudioLiveMicControl | null;
  onRequestClose: () => void;
  username?: string;
}>;

export function StudioTopChrome({
  closeDisabled = false,
  liveCameraSwitchControl = null,
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
      {liveMicControl || liveCameraSwitchControl ? (
        <div className={styles.trailingCluster}>
          {liveMicControl ? (
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
          ) : null}
          {liveCameraSwitchControl ? (
            <button
              aria-label="Kamerayi degistir"
              className={styles.utilityButton}
              disabled={liveCameraSwitchControl.isPending}
              onClick={liveCameraSwitchControl.onSwitch}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={18} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
