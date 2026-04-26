"use client";

import { Track, type RemoteTrack, type Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLiveWatchAudioControl } from "../_components/live-watch-audio-control-context";
import {
  attachLiveWatchAudioTrack,
  attachLiveWatchVideoTrack,
  bindLiveWatchRoom,
  bindLiveWatchTrackPlaybackEvents,
  detachLiveWatchTrack,
  disconnectLiveWatchRoom,
  retryLiveWatchPlayback,
  connectLiveWatchRoom
} from "../_adapters/live-watch-provider-adapter";
import { fetchLiveWatchViewerToken } from "../_adapters/live-watch-token-adapter";

const TRACK_WAIT_TIMEOUT_MS = 12000;

type LiveWatchPlaybackState =
  | "connecting"
  | "playing"
  | "playback_blocked"
  | "degraded";

export function useLiveWatchPlayback(username: string) {
  const { isMuted } = useLiveWatchAudioControl();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);
  const audioTrackCleanupRef = useRef<(() => void) | null>(null);
  const audioTrackRef = useRef<RemoteTrack | null>(null);
  const bindCleanupRef = useRef<(() => void) | null>(null);
  const hasPlayableTrackRef = useRef(false);
  const roomRef = useRef<Room | null>(null);
  const trackWaitTimeoutRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoTrackCleanupRef = useRef<(() => void) | null>(null);
  const videoTrackRef = useRef<RemoteTrack | null>(null);
  const [canRetryPlayback, setCanRetryPlayback] = useState(false);
  const [playbackMessage, setPlaybackMessage] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [playbackState, setPlaybackState] =
    useState<LiveWatchPlaybackState>("connecting");

  useEffect(() => {
    isMutedRef.current = isMuted;

    if (!audioElementRef.current) {
      return;
    }

    audioElementRef.current.muted = isMuted;
  }, [isMuted]);

  const clearTrackWaitTimeout = useCallback(() => {
    if (trackWaitTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(trackWaitTimeoutRef.current);
    trackWaitTimeoutRef.current = null;
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

  const cleanupPlayback = useCallback(async () => {
    clearTrackWaitTimeout();
    bindCleanupRef.current?.();
    bindCleanupRef.current = null;
    detachVideoTrack();
    detachAudioTrack();
    hasPlayableTrackRef.current = false;

    const room = roomRef.current;
    roomRef.current = null;
    setRoom(null);
    await disconnectLiveWatchRoom(room);
  }, [clearTrackWaitTimeout, detachAudioTrack, detachVideoTrack]);

  const setTrackWaitTimeout = useCallback(() => {
    clearTrackWaitTimeout();
    trackWaitTimeoutRef.current = window.setTimeout(() => {
      if (hasPlayableTrackRef.current) {
        return;
      }

      setPlaybackMessage("Canlı yayın akışı şu anda bağlanamıyor.");
      setPlaybackState("degraded");
    }, TRACK_WAIT_TIMEOUT_MS);
  }, [clearTrackWaitTimeout]);

  const handlePlaybackStarted = useCallback(() => {
    clearTrackWaitTimeout();
    hasPlayableTrackRef.current = true;
    setCanRetryPlayback(false);
    setPlaybackMessage(null);
    setPlaybackState("playing");
  }, [clearTrackWaitTimeout]);

  const bindTrackPlaybackEvents = useCallback(
    (track: RemoteTrack) => {
      return bindLiveWatchTrackPlaybackEvents(track, {
        onPlaybackFailed: () => {
          setCanRetryPlayback(true);

          if (!hasPlayableTrackRef.current) {
            setPlaybackMessage(
              "Yayını açmak için oynatmayı başlatman gerekebilir."
            );
            setPlaybackState("playback_blocked");
          }
        },
        onPlaybackStarted: handlePlaybackStarted
      });
    },
    [handlePlaybackStarted]
  );

  const attachTrack = useCallback(
    async (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video) {
        const videoElement = videoElementRef.current;

        if (!videoElement) {
          return;
        }

        detachVideoTrack();
        videoTrackRef.current = track;
        videoTrackCleanupRef.current = bindTrackPlaybackEvents(track);

        const didAttach = await attachLiveWatchVideoTrack(track, videoElement);

        if (didAttach) {
          handlePlaybackStarted();
          return;
        }

        setCanRetryPlayback(true);
        setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
        setPlaybackState("playback_blocked");
        return;
      }

      if (track.kind === Track.Kind.Audio) {
        const audioElement = audioElementRef.current;

        if (!audioElement) {
          return;
        }

        detachAudioTrack();
        audioTrackRef.current = track;
        audioTrackCleanupRef.current = bindTrackPlaybackEvents(track);
        audioElement.muted = isMutedRef.current;

        const didAttach = await attachLiveWatchAudioTrack(track, audioElement);

        if (didAttach) {
          handlePlaybackStarted();
          return;
        }

        setCanRetryPlayback(true);

        if (!hasPlayableTrackRef.current) {
          setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
          setPlaybackState("playback_blocked");
        }
      }
    },
    [
      bindTrackPlaybackEvents,
      detachAudioTrack,
      detachVideoTrack,
      handlePlaybackStarted
    ]
  );

  const retryPlayback = useCallback(async () => {
    const didRetry = await retryLiveWatchPlayback(
      videoElementRef.current,
      audioElementRef.current
    );

    if (!didRetry) {
      setPlaybackMessage("Yayını açmak için oynatmayı başlatman gerekebilir.");
      setPlaybackState("playback_blocked");
      return;
    }

    handlePlaybackStarted();
  }, [handlePlaybackStarted]);

  useEffect(() => {
    let didCancel = false;

    async function startPlayback() {
      setPlaybackState("connecting");
      setPlaybackMessage(null);
      setCanRetryPlayback(false);
      setTrackWaitTimeout();

      const tokenResult = await fetchLiveWatchViewerToken(username);

      if (didCancel) {
        return;
      }

      if (tokenResult.kind === "not_live") {
        clearTrackWaitTimeout();
        setPlaybackMessage("Yayın artık açık değil. Sayfa birazdan güncellenecek.");
        setPlaybackState("playback_blocked");
        return;
      }

      if (tokenResult.kind !== "success") {
        clearTrackWaitTimeout();
        setPlaybackMessage("Canlı yayın akışı şu anda bağlanamıyor.");
        setPlaybackState("degraded");
        return;
      }

      const connectionResult = await connectLiveWatchRoom(tokenResult.payload);

      if (didCancel) {
        if (connectionResult.kind === "success") {
          await disconnectLiveWatchRoom(connectionResult.room);
        }

        return;
      }

      if (connectionResult.kind !== "success") {
        clearTrackWaitTimeout();
        setPlaybackMessage("Canlı yayın akışı şu anda bağlanamıyor.");
        setPlaybackState("degraded");
        return;
      }

      roomRef.current = connectionResult.room;
      setRoom(connectionResult.room);

      const binding = bindLiveWatchRoom(connectionResult.room, {
        onDisconnected: () => {
          setPlaybackMessage("Canlı yayın bağlantısı kesildi. Sayfa yenileniyor.");
          setPlaybackState("degraded");
        },
        onSubscriptionFailed: () => {
          if (hasPlayableTrackRef.current) {
            return;
          }

          clearTrackWaitTimeout();
          setPlaybackMessage("Canlı yayın akışı şu anda bağlanamıyor.");
          setPlaybackState("degraded");
        },
        onTrackSubscribed: (track) => {
          void attachTrack(track);
        },
        onTrackUnsubscribed: (track) => {
          if (track.kind === Track.Kind.Video && videoTrackRef.current === track) {
            detachVideoTrack();
          }

          if (track.kind === Track.Kind.Audio && audioTrackRef.current === track) {
            detachAudioTrack();
          }
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
    clearTrackWaitTimeout,
    detachAudioTrack,
    detachVideoTrack,
    setTrackWaitTimeout,
    username
  ]);

  return {
    audioRef: audioElementRef,
    canRetryPlayback,
    playbackMessage,
    playbackState,
    room,
    retryPlayback,
    videoRef: videoElementRef
  };
}
