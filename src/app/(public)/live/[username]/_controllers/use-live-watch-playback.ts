"use client";

import { Track, type RemoteTrack, type Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLiveWatchAudioControl } from "../_components/live-watch-audio-control-context";
import {
  attachLiveWatchAudioTrack,
  attachLiveWatchVideoTrack,
  bindLiveWatchRoom,
  bindLiveWatchTrackPlaybackEvents,
  connectLiveWatchRoom,
  detachLiveWatchTrack,
  disconnectLiveWatchRoom,
  retryLiveWatchPlayback
} from "../_adapters/live-watch-provider-adapter";
import { fetchLiveWatchViewerToken } from "../_adapters/live-watch-token-adapter";

const TRACK_WAIT_TIMEOUT_MS = 12000;
const PLAYBACK_DEGRADED_MESSAGE = "Canlı yayın akışı şu anda bağlanamıyor.";
type LiveWatchPlaybackState = "connecting" | "playing" | "playback_blocked" | "degraded";

export function useLiveWatchPlayback(username: string) {
  const { isMuted } = useLiveWatchAudioControl();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isDisposedRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  const audioTrackCleanupRef = useRef<(() => void) | null>(null);
  const audioTrackRef = useRef<RemoteTrack | null>(null);
  const bindCleanupRef = useRef<(() => void) | null>(null);
  const hasPlayableTrackRef = useRef(false);
  const hasRequestedLiveStatusCheckRef = useRef(false);
  const pendingVideoLossCheckFrameRef = useRef<number | null>(null);
  const roomRef = useRef<Room | null>(null);
  const trackWaitTimeoutRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoTrackCleanupRef = useRef<(() => void) | null>(null);
  const videoTrackRef = useRef<RemoteTrack | null>(null);
  const [canRetryPlayback, setCanRetryPlayback] = useState(false);
  const [liveStatusCheckRequestSequence, setLiveStatusCheckRequestSequence] = useState(0);
  const [playbackMessage, setPlaybackMessage] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [playbackState, setPlaybackState] = useState<LiveWatchPlaybackState>("connecting");

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioElementRef.current) audioElementRef.current.muted = isMuted;
  }, [isMuted]);

  const clearTrackWaitTimeout = useCallback(() => {
    if (trackWaitTimeoutRef.current === null) return;
    window.clearTimeout(trackWaitTimeoutRef.current);
    trackWaitTimeoutRef.current = null;
  }, []);

  const clearPendingVideoLossCheckFrame = useCallback(() => {
    if (pendingVideoLossCheckFrameRef.current === null) return;
    cancelAnimationFrame(pendingVideoLossCheckFrameRef.current);
    pendingVideoLossCheckFrameRef.current = null;
  }, []);

  const detachVideoTrack = useCallback(() => {
    videoTrackCleanupRef.current?.();
    videoTrackCleanupRef.current = null;
    detachLiveWatchTrack(videoTrackRef.current, videoElementRef.current);
    videoTrackRef.current = null;
  }, []);

  const detachAudioTrack = useCallback(() => {
    audioTrackCleanupRef.current?.();
    audioTrackCleanupRef.current = null;
    detachLiveWatchTrack(audioTrackRef.current, audioElementRef.current);
    audioTrackRef.current = null;
  }, []);

  const emitLiveStatusCheckRequest = useCallback(() => {
    if (isDisposedRef.current || hasRequestedLiveStatusCheckRef.current) return;
    hasRequestedLiveStatusCheckRef.current = true;
    setLiveStatusCheckRequestSequence((currentSequence) => currentSequence + 1);
  }, []);

  const setDegradedPlaybackForStatusCheck = useCallback(() => {
    if (isDisposedRef.current) return;
    clearTrackWaitTimeout();
    hasPlayableTrackRef.current = false;
    setCanRetryPlayback(true);
    setPlaybackMessage(PLAYBACK_DEGRADED_MESSAGE);
    setPlaybackState("degraded");
    emitLiveStatusCheckRequest();
  }, [clearTrackWaitTimeout, emitLiveStatusCheckRequest]);

  const cleanupPlayback = useCallback(async () => {
    clearTrackWaitTimeout();
    clearPendingVideoLossCheckFrame();
    bindCleanupRef.current?.();
    bindCleanupRef.current = null;
    detachVideoTrack();
    detachAudioTrack();
    hasPlayableTrackRef.current = false;
    const room = roomRef.current;
    roomRef.current = null;
    setRoom(null);
    await disconnectLiveWatchRoom(room);
  }, [clearPendingVideoLossCheckFrame, clearTrackWaitTimeout, detachAudioTrack, detachVideoTrack]);

  const setTrackWaitTimeout = useCallback(() => {
    clearTrackWaitTimeout();
    trackWaitTimeoutRef.current = window.setTimeout(() => {
      if (isDisposedRef.current || hasPlayableTrackRef.current) return;
      setPlaybackMessage(PLAYBACK_DEGRADED_MESSAGE);
      setPlaybackState("degraded");
    }, TRACK_WAIT_TIMEOUT_MS);
  }, [clearTrackWaitTimeout]);

  const handlePlaybackStarted = useCallback(() => {
    clearPendingVideoLossCheckFrame();
    clearTrackWaitTimeout();
    hasPlayableTrackRef.current = true;
    hasRequestedLiveStatusCheckRef.current = false;
    setCanRetryPlayback(false);
    setPlaybackMessage(null);
    setPlaybackState("playing");
  }, [clearPendingVideoLossCheckFrame, clearTrackWaitTimeout]);

  const bindTrackPlaybackEvents = useCallback(
    (track: RemoteTrack) =>
      bindLiveWatchTrackPlaybackEvents(track, {
        onPlaybackFailed: () => {
          if (isDisposedRef.current) return;
          setCanRetryPlayback(true);
          if (hasPlayableTrackRef.current) return;
          setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
          setPlaybackState("playback_blocked");
        },
        onPlaybackStarted: handlePlaybackStarted
      }),
    [handlePlaybackStarted]
  );

  const attachTrack = useCallback(
    async (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video) {
        const videoElement = videoElementRef.current;
        if (!videoElement) return;

        clearPendingVideoLossCheckFrame();
        detachVideoTrack();
        videoTrackRef.current = track;
        videoTrackCleanupRef.current = bindTrackPlaybackEvents(track);

        const didAttach = await attachLiveWatchVideoTrack(track, videoElement);
        if (isDisposedRef.current || videoTrackRef.current !== track) return;
        if (didAttach) return handlePlaybackStarted();

        setCanRetryPlayback(true);
        setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
        setPlaybackState("playback_blocked");
        return;
      }

      if (track.kind !== Track.Kind.Audio) return;
      const audioElement = audioElementRef.current;
      if (!audioElement) return;

      detachAudioTrack();
      audioTrackRef.current = track;
      audioTrackCleanupRef.current = bindTrackPlaybackEvents(track);
      audioElement.muted = isMutedRef.current;

      const didAttach = await attachLiveWatchAudioTrack(track, audioElement);
      if (isDisposedRef.current || audioTrackRef.current !== track) return;
      if (didAttach) return handlePlaybackStarted();

      setCanRetryPlayback(true);
      if (hasPlayableTrackRef.current) return;
      setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
      setPlaybackState("playback_blocked");
    },
    [bindTrackPlaybackEvents, clearPendingVideoLossCheckFrame, detachAudioTrack, detachVideoTrack, handlePlaybackStarted]
  );

  const retryPlayback = useCallback(async () => {
    const didRetry = await retryLiveWatchPlayback(videoElementRef.current, audioElementRef.current);
    if (isDisposedRef.current) return;
    if (didRetry) return handlePlaybackStarted();
    setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
    setPlaybackState("playback_blocked");
  }, [handlePlaybackStarted]);

  useEffect(() => {
    isDisposedRef.current = false;
    return () => {
      isDisposedRef.current = true;
      clearPendingVideoLossCheckFrame();
    };
  }, [clearPendingVideoLossCheckFrame]);

  useEffect(() => {
    let didCancel = false;

    async function startPlayback() {
      setPlaybackState("connecting");
      setPlaybackMessage(null);
      setCanRetryPlayback(false);
      setTrackWaitTimeout();

      const tokenResult = await fetchLiveWatchViewerToken(username);
      if (didCancel) return;
      if (tokenResult.kind === "not_live") return setDegradedPlaybackForStatusCheck();
      if (tokenResult.kind !== "success") {
        clearTrackWaitTimeout();
        setPlaybackMessage(PLAYBACK_DEGRADED_MESSAGE);
        setPlaybackState("degraded");
        return;
      }

      const connectionResult = await connectLiveWatchRoom(tokenResult.payload);
      if (didCancel) {
        if (connectionResult.kind === "success") await disconnectLiveWatchRoom(connectionResult.room);
        return;
      }

      if (connectionResult.kind !== "success") {
        clearTrackWaitTimeout();
        setPlaybackMessage(PLAYBACK_DEGRADED_MESSAGE);
        setPlaybackState("degraded");
        return;
      }

      roomRef.current = connectionResult.room;
      setRoom(connectionResult.room);

      const binding = bindLiveWatchRoom(connectionResult.room, {
        onDisconnected: () => {
          if (isDisposedRef.current) return;
          setPlaybackMessage("Canlı yayın bağlantısı kesildi. Sayfa yenileniyor.");
          setPlaybackState("degraded");
        },
        onSubscriptionFailed: () => {
          if (isDisposedRef.current || hasPlayableTrackRef.current) return;
          clearTrackWaitTimeout();
          setPlaybackMessage(PLAYBACK_DEGRADED_MESSAGE);
          setPlaybackState("degraded");
        },
        onTrackSubscribed: (track) => {
          void attachTrack(track);
        },
        onTrackUnsubscribed: (track) => {
          if (track.kind === Track.Kind.Audio) {
            if (audioTrackRef.current === track) detachAudioTrack();
            return;
          }
          if (track.kind !== Track.Kind.Video || videoTrackRef.current !== track) return;

          detachVideoTrack();
          clearPendingVideoLossCheckFrame();
          pendingVideoLossCheckFrameRef.current = requestAnimationFrame(() => {
            pendingVideoLossCheckFrameRef.current = null;
            if (isDisposedRef.current) return;
            if (videoTrackRef.current || videoElementRef.current?.srcObject) return;
            setDegradedPlaybackForStatusCheck();
          });
        }
      });

      bindCleanupRef.current = binding.cleanup;
      binding.reconcileTracks();
    }

    void startPlayback();
    return () => {
      didCancel = true;
      void cleanupPlayback();
    };
  }, [
    attachTrack,
    cleanupPlayback,
    clearPendingVideoLossCheckFrame,
    clearTrackWaitTimeout,
    detachAudioTrack,
    detachVideoTrack,
    setDegradedPlaybackForStatusCheck,
    setTrackWaitTimeout,
    username
  ]);

  return {
    audioRef: audioElementRef,
    canRetryPlayback,
    liveStatusCheckRequestSequence,
    playbackMessage,
    playbackState,
    room,
    retryPlayback,
    videoRef: videoElementRef
  };
}
