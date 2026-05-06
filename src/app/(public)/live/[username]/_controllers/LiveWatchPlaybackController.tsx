"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";

import { useLiveWatchTransitionCoverContext } from "../_components/live-watch-transition-cover-context";
import {
  useLiveWatchViewerCountContext,
  type LiveWatchViewerCountMetric
} from "../_components/live-watch-viewer-count-context";
import { LiveWatchChatController, type LiveWatchChatAccess } from "./LiveWatchChatController";
import { LiveWatchPlaybackSurface } from "../_components/LiveWatchPlaybackSurface";
import { useLiveWatchViewerCountMetric } from "./useLiveWatchViewerCountMetric";
import { useLiveWatchPlayback } from "./use-live-watch-playback";
import { useLiveWatchPlaybackTransition } from "./use-live-watch-playback-transition";

function getLiveWatchViewerConnectionKey(access: LiveWatchChatAccess) {
  if (access.kind === "viewer_ready") {
    return `viewer_ready:${access.viewerUsername}`;
  }

  return access.kind;
}

const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function LiveWatchPlaybackController({
  chatAccess,
  username
}: Readonly<{
  chatAccess: LiveWatchChatAccess;
  username: string;
}>) {
  const { resetCoverVisible, setCoverVisible } = useLiveWatchTransitionCoverContext();
  const { setViewerCountMetric } = useLiveWatchViewerCountContext();
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
  const viewerCount = useLiveWatchViewerCountMetric(room);
  const { isChatVisible, overlayMode, shouldShowShellCover } =
    useLiveWatchPlaybackTransition({
      liveStatusCheckRequestSequence,
      mediaReady,
      playbackMessage,
      playbackState
    });
  const viewerCountMetric = useMemo<LiveWatchViewerCountMetric | null>(() => {
    if (room === null || viewerCount === null || viewerCount <= 0) {
      return null;
    }

    const text = String(viewerCount);

    return {
      accessibilityText: `İzleyici sayısı: ${text}`,
      text
    };
  }, [room, viewerCount]);

  useEffect(() => {
    setViewerCountMetric(viewerCountMetric);
  }, [setViewerCountMetric, viewerCountMetric]);

  useEffect(() => {
    return () => {
      setViewerCountMetric(null);
    };
  }, [setViewerCountMetric]);

  useClientLayoutEffect(() => {
    setCoverVisible(shouldShowShellCover);
  }, [setCoverVisible, shouldShowShellCover]);

  useEffect(() => {
    return () => {
      resetCoverVisible();
    };
  }, [resetCoverVisible]);

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
