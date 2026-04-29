"use client";

import { LiveWatchChatController, type LiveWatchChatAccess } from "./LiveWatchChatController";
import { LiveWatchPlaybackSurface } from "../_components/LiveWatchPlaybackSurface";
import { useLiveWatchPlayback } from "./use-live-watch-playback";
import { useLiveWatchPlaybackTransition } from "./use-live-watch-playback-transition";

function getLiveWatchViewerConnectionKey(access: LiveWatchChatAccess) {
  if (access.kind === "viewer_ready") {
    return `viewer_ready:${access.viewerUsername}`;
  }

  return access.kind;
}

export function LiveWatchPlaybackController({
  chatAccess,
  username
}: Readonly<{
  chatAccess: LiveWatchChatAccess;
  username: string;
}>) {
  const viewerConnectionKey = getLiveWatchViewerConnectionKey(chatAccess);
  const {
    audioRef,
    canRetryPlayback,
    liveStatusCheckRequestSequence,
    mediaReady,
    playbackMessage,
    playbackState,
    room,
    retryPlayback,
    videoRef
  } = useLiveWatchPlayback(username, viewerConnectionKey);
  const { isChatVisible, overlayAccessibleLabel, overlayMode } =
    useLiveWatchPlaybackTransition({
      liveStatusCheckRequestSequence,
      mediaReady,
      playbackMessage,
      playbackState
    });

  return (
    <LiveWatchPlaybackSurface
      audioRef={audioRef}
      canRetryPlayback={canRetryPlayback}
      chatOverlay={
        <LiveWatchChatController
          access={chatAccess}
          isInteractive={isChatVisible}
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
