"use client";

import type { RefObject } from "react";

import styles from "./live-watch.module.css";

type LiveWatchPlaybackSurfaceProps = Readonly<{
  audioRef: RefObject<HTMLAudioElement | null>;
  canRetryPlayback: boolean;
  playbackMessage: string | null;
  playbackState: "connecting" | "playing" | "playback_blocked" | "degraded";
  onRetryPlayback: () => void;
  username: string;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

export function LiveWatchPlaybackSurface({
  audioRef,
  canRetryPlayback,
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

        {playbackState === "playing" && !playbackMessage ? null : (
          <div className={styles.frameOverlay}>
            <div className={styles.frameInner}>
              <h2 className="t-h2">Canli yayin</h2>
              <p className={`t-body ${styles.frameBody}`}>
                {playbackMessage ?? "Canli yayin baglaniyor."}
              </p>
              {canRetryPlayback ? (
                <button
                  className={styles.retryButton}
                  onClick={onRetryPlayback}
                  type="button"
                >
                  Oynatmayi baslat
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
