import { Eye, Mic, MicOff, SwitchCamera, X } from "lucide-react";

import styles from "./studio-top-chrome.module.css";

const CHROME_ICON_SIZE = 17;
const CHROME_ICON_STROKE_WIDTH = 2.05;

export type StudioMicControl = Readonly<{
  isMuted: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

export type StudioCameraControl = Readonly<{
  isAvailable: boolean;
  isPending: boolean;
  onToggle: () => void;
}>;

export type StudioViewerCountMetric = Readonly<{
  accessibilityText: string;
  text: string;
}>;

type StudioTopChromeProps = Readonly<{
  cameraControl?: StudioCameraControl | null;
  closeDisabled?: boolean;
  micControl?: StudioMicControl | null;
  onRequestClose: () => void;
  username?: string;
  viewerCountMetric?: StudioViewerCountMetric | null;
}>;

export function StudioTopChrome({
  cameraControl = null,
  closeDisabled = false,
  micControl = null,
  onRequestClose,
  username,
  viewerCountMetric = null
}: StudioTopChromeProps) {
  return (
    <header
      className={styles.chrome}
      data-layout="scene"
      data-surface="approved"
      data-has-viewer-metric={viewerCountMetric ? "true" : "false"}
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
      {cameraControl?.isAvailable || micControl ? (
        <div className={styles.trailingCluster}>
          {cameraControl?.isAvailable ? (
            <button
              aria-label="Kamerayı değiştir"
              className={styles.utilityButton}
              disabled={cameraControl.isPending}
              onClick={cameraControl.onToggle}
              type="button"
            >
              <SwitchCamera
                aria-hidden="true"
                size={CHROME_ICON_SIZE}
                strokeWidth={CHROME_ICON_STROKE_WIDTH}
              />
            </button>
          ) : null}
          {micControl ? (
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
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
