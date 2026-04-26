"use client";

import type { ReactNode, RefObject } from "react";

import styles from "./live-watch.module.css";

type LiveWatchPlaybackSurfaceProps = Readonly<{
  audioRef: RefObject<HTMLAudioElement | null>;
  canRetryPlayback: boolean;
  chatOverlay?: ReactNode;
  overlayAccessibleLabel: string | null;
  overlayMode: "message" | "spinner_only";
  playbackMessage: string | null;
  playbackState: "connecting" | "playing" | "playback_blocked" | "degraded";
  onRetryPlayback: () => void;
  username: string;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

export function LiveWatchPlaybackSurface({
  audioRef,
  canRetryPlayback,
  chatOverlay,
  overlayAccessibleLabel,
  overlayMode,
  playbackMessage,
  playbackState,
  onRetryPlayback,
  username,
  videoRef
}: LiveWatchPlaybackSurfaceProps) {
  return (
    <section className={styles.frame} aria-label={`@${username} canli yayin cercevesi`}>
      <div className={styles.mediaStage}>
        <video
          className={
            playbackState === "playing" ? styles.playbackVideo : styles.playbackVideoHidden
          }
          playsInline
          ref={videoRef}
        />
        <audio ref={audioRef} />
        {chatOverlay}

        {playbackState === "playing" && !playbackMessage ? null : overlayMode ===
          "spinner_only" ? (
          <div
            aria-label={overlayAccessibleLabel ?? "Yayın durumu güncelleniyor"}
            className={styles.frameOverlay}
            role="status"
          >
            <div className={styles.spinnerOnlyShell}>
              <div className={styles.spinnerOnlyPresence} aria-hidden="true">
                <span className={styles.loadingSpinner} />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.frameOverlay}>
            <div className={styles.frameInner}>
              {playbackState === "connecting" ? (
                <div className={styles.loadingPresence} aria-hidden="true">
                  <span className={styles.loadingSpinner} />
                </div>
              ) : null}
              <h2 className="t-h2">Canlı yayın</h2>
              <p className={`t-body ${styles.frameBody}`}>
                {playbackMessage ?? "Canlı yayın bağlanıyor."}
              </p>
              {canRetryPlayback ? (
                <button
                  className={styles.retryButton}
                  onClick={onRetryPlayback}
                  type="button"
                >
                  Oynatmayı başlat
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
