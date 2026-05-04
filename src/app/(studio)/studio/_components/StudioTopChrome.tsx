import { Mic, MicOff, X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

const CHROME_ICON_SIZE = 17;
const CHROME_ICON_STROKE_WIDTH = 2.05;

export type StudioMicControl = Readonly<{
  isMuted: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

type StudioTopChromeProps = Readonly<{
  closeDisabled?: boolean;
  micControl?: StudioMicControl | null;
  onRequestClose: () => void;
  username?: string;
}>;

export function StudioTopChrome({
  closeDisabled = false,
  micControl = null,
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
          <X
            aria-hidden="true"
            size={CHROME_ICON_SIZE}
            strokeWidth={CHROME_ICON_STROKE_WIDTH}
          />
        </button>
        {username ? (
          <p className={`t-label ${styles.usernameLabel}`}>@{username}</p>
        ) : null}
      </div>
      {micControl ? (
        <div className={styles.trailingCluster}>
          <button
            aria-label={micControl.isMuted ? "Mikrofonu ac" : "Mikrofonu kapat"}
            aria-pressed={micControl.isMuted}
            className={styles.utilityButton}
            data-state={micControl.isMuted ? "muted" : "active"}
            disabled={micControl.isPending}
            onClick={micControl.onToggle}
            type="button"
          >
            {micControl.isMuted ? (
              <MicOff
                aria-hidden="true"
                size={CHROME_ICON_SIZE}
                strokeWidth={CHROME_ICON_STROKE_WIDTH}
              />
            ) : (
              <Mic
                aria-hidden="true"
                size={CHROME_ICON_SIZE}
                strokeWidth={CHROME_ICON_STROKE_WIDTH}
              />
            )}
          </button>
        </div>
      ) : null}
    </header>
  );
}
