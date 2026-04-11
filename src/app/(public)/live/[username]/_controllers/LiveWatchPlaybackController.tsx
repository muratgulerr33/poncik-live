"use client";

import { LiveWatchPlaybackSurface } from "../_components/LiveWatchPlaybackSurface";
import { useLiveWatchPlayback } from "./use-live-watch-playback";

export function LiveWatchPlaybackController({
  username
}: Readonly<{
  username: string;
}>) {
  const {
    audioRef,
    canRetryPlayback,
    playbackMessage,
    playbackState,
    retryPlayback,
    videoRef
  } = useLiveWatchPlayback(username);

  return (
    <LiveWatchPlaybackSurface
      audioRef={audioRef}
      canRetryPlayback={canRetryPlayback}
      playbackMessage={playbackMessage}
      playbackState={playbackState}
      onRetryPlayback={() => {
        void retryPlayback();
      }}
      username={username}
      videoRef={videoRef}
    />
  );
}
