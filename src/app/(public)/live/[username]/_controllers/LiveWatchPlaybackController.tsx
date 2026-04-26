"use client";

import { LiveWatchChatController, type LiveWatchChatAccess } from "./LiveWatchChatController";
import { LiveWatchPlaybackSurface } from "../_components/LiveWatchPlaybackSurface";
import { useLiveWatchPlayback } from "./use-live-watch-playback";
import { useLiveWatchPlaybackTransition } from "./use-live-watch-playback-transition";

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
    liveStatusCheckRequestSequence,
    playbackMessage,
    playbackState,
    room,
    retryPlayback,
    videoRef
  } = useLiveWatchPlayback(username);
  const { overlayAccessibleLabel, overlayMode } =
    useLiveWatchPlaybackTransition({
      liveStatusCheckRequestSequence,
      playbackState
    });

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
      overlayAccessibleLabel={overlayAccessibleLabel}
      overlayMode={overlayMode}
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
