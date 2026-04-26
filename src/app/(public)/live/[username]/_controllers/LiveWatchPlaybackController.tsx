"use client";

import { LiveWatchChatController, type LiveWatchChatAccess } from "./LiveWatchChatController";
import { LiveWatchPlaybackSurface } from "../_components/LiveWatchPlaybackSurface";
import { useLiveWatchPlayback } from "./use-live-watch-playback";

export function LiveWatchPlaybackController({
  chatAccess,
  username
}: Readonly<{
  chatAccess: LiveWatchChatAccess;
  username: string;
}>) {
  const {
    audioRef,
    canRetryPlayback,
    playbackMessage,
    playbackState,
    room,
    retryPlayback,
    videoRef
  } = useLiveWatchPlayback(username);

  return (
    <LiveWatchPlaybackSurface
      audioRef={audioRef}
      canRetryPlayback={canRetryPlayback}
      chatOverlay={
        <LiveWatchChatController
          access={chatAccess}
          isInteractive={playbackState === "playing"}
          room={room}
        />
      }
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
