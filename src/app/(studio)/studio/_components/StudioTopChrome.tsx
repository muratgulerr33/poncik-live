import { Mic, MicOff, SwitchCamera, X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

const CHROME_ICON_SIZE = 17;
const CHROME_ICON_STROKE_WIDTH = 2.05;

export type StudioLiveMicControl = Readonly<{
  isMuted: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

export type StudioLiveCameraControl = Readonly<{
  isPending: boolean;
  onSwitch: () => void;
}>;

type StudioTopChromeProps = Readonly<{
  closeDisabled?: boolean;
  liveCameraControl?: StudioLiveCameraControl | null;
  liveMicControl?: StudioLiveMicControl | null;
  onRequestClose: () => void;
  username?: string;
}>;

export function StudioTopChrome({
  closeDisabled = false,
  liveCameraControl = null,
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
      {liveMicControl || liveCameraControl ? (
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
          ) : null}
          {liveCameraControl ? (
            <button
              aria-label="Kamerayi degistir"
              className={styles.utilityButton}
              data-state="active"
              disabled={liveCameraControl.isPending}
              onClick={liveCameraControl.onSwitch}
              type="button"
            >
              <SwitchCamera
                aria-hidden="true"
                size={CHROME_ICON_SIZE}
                strokeWidth={CHROME_ICON_STROKE_WIDTH}
              />
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
