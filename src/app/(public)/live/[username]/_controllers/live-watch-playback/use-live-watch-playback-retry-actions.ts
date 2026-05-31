"use client";

import { type RemoteTrack, type Room } from "livekit-client";
import { useCallback } from "react";

import { retryLiveWatchPlayback } from "../../_adapters/live-watch-provider-adapter";

type ReadonlyCurrentRef<T> = Readonly<{
  current: T;
}>;

type UseLiveWatchPlaybackRetryActionsArgs = Readonly<{
  audioElementRef: ReadonlyCurrentRef<HTMLAudioElement | null>;
  handlePlaybackStarted: () => void;
  isDisposedRef: ReadonlyCurrentRef<boolean>;
  reconcileSettledVideoPlayback: () => boolean;
  roomRef: ReadonlyCurrentRef<Room | null>;
  setAudioBlocked: (blocked: boolean) => void;
  setMediaReady: (ready: boolean) => void;
  setPlaybackMessage: (message: string | null) => void;
  setPlaybackState: (state: "playback_blocked") => void;
  videoElementRef: ReadonlyCurrentRef<HTMLVideoElement | null>;
  videoTrackRef: ReadonlyCurrentRef<RemoteTrack | null>;
}>;

export function useLiveWatchPlaybackRetryActions({
  audioElementRef,
  handlePlaybackStarted,
  isDisposedRef,
  reconcileSettledVideoPlayback,
  roomRef,
  setAudioBlocked,
  setMediaReady,
  setPlaybackMessage,
  setPlaybackState,
  videoElementRef,
  videoTrackRef
}: UseLiveWatchPlaybackRetryActionsArgs) {
  const retryPlayback = useCallback(async () => {
    const didRetry = await retryLiveWatchPlayback({
      room: roomRef.current,
      videoElement: videoElementRef.current,
      audioElement: audioElementRef.current
    });
    if (isDisposedRef.current) return;
    if (didRetry) {
      setAudioBlocked(false);
      if (reconcileSettledVideoPlayback()) {
        return;
      }
      if (videoTrackRef.current && videoElementRef.current?.srcObject) {
        setMediaReady(true);
      }
      return handlePlaybackStarted();
    }
    setMediaReady(false);
    setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
    setPlaybackState("playback_blocked");
  }, [
    audioElementRef,
    handlePlaybackStarted,
    isDisposedRef,
    reconcileSettledVideoPlayback,
    roomRef,
    setAudioBlocked,
    setMediaReady,
    setPlaybackMessage,
    setPlaybackState,
    videoElementRef,
    videoTrackRef
  ]);

  const unlockAudioFromUserGesture = useCallback(async () => {
    const didUnlock = await retryLiveWatchPlayback({
      room: roomRef.current,
      videoElement: videoElementRef.current,
      audioElement: audioElementRef.current
    });

    if (isDisposedRef.current) {
      return false;
    }

    if (didUnlock) {
      setAudioBlocked(false);

      if (reconcileSettledVideoPlayback()) {
        return true;
      }

      if (videoTrackRef.current && videoElementRef.current?.srcObject) {
        setMediaReady(true);
        handlePlaybackStarted();
      }

      return true;
    }

    if (videoTrackRef.current && videoElementRef.current?.srcObject) {
      setAudioBlocked(true);
      return false;
    }

    setMediaReady(false);
    setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
    setPlaybackState("playback_blocked");
    return false;
  }, [
    audioElementRef,
    handlePlaybackStarted,
    isDisposedRef,
    reconcileSettledVideoPlayback,
    roomRef,
    setAudioBlocked,
    setMediaReady,
    setPlaybackMessage,
    setPlaybackState,
    videoElementRef,
    videoTrackRef
  ]);

  return {
    retryPlayback,
    unlockAudioFromUserGesture
  };
}
