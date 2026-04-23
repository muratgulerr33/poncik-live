"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readStudioBrowserCapabilityState } from "../_adapters/studio-browser-capability-adapter";
import {
  attachStudioPreviewStream,
  requestStudioPreviewStream,
  stopStudioPreviewStream,
  type StudioPreviewState
} from "../_adapters/studio-preview-adapter";

const PREVIEW_TIMEOUT_MS = 12000;

export function useStudioPreviewBootstrap() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const attemptIdRef = useRef(0);
  const initialBootstrapAttemptIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const [isInitialBootstrapPending, setIsInitialBootstrapPending] = useState(true);
  const [previewState, setPreviewState] = useState<StudioPreviewState>("requesting");

  function isRetryableState(state: StudioPreviewState) {
    return state === "blocked" || state === "timeout" || state === "degraded";
  }

  const clearPreviewElement = useCallback(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    videoElement.pause();
    videoElement.srcObject = null;
  }, []);

  const cleanupStream = useCallback(() => {
    stopStudioPreviewStream(streamRef.current);
    streamRef.current = null;
    clearPreviewElement();
  }, [clearPreviewElement]);

  const settleInitialBootstrapPending = useCallback((attemptId: number) => {
    if (initialBootstrapAttemptIdRef.current !== attemptId) {
      return;
    }

    initialBootstrapAttemptIdRef.current = null;

    if (isMountedRef.current) {
      setIsInitialBootstrapPending(false);
    }
  }, []);

  const getPreviewStream = useCallback(() => streamRef.current, []);

  const replacePreviewVideoTrack = useCallback(
    async (nextVideoTrack: MediaStreamTrack): Promise<boolean> => {
      const currentPreviewStream = streamRef.current;
      const currentPreviewVideoTrack = currentPreviewStream?.getVideoTracks()[0] ?? null;
      const videoElement = videoRef.current;

      if (!currentPreviewStream || !currentPreviewVideoTrack || !videoElement) {
        return false;
      }

      const replacementVideoTrack = nextVideoTrack.clone();
      const preservedNonVideoTracks = currentPreviewStream
        .getTracks()
        .filter((track) => track.kind !== "video");
      const nextPreviewStream = new MediaStream([
        ...preservedNonVideoTracks,
        replacementVideoTrack
      ]);
      const didAttach = await attachStudioPreviewStream(videoElement, nextPreviewStream);

      if (!didAttach) {
        replacementVideoTrack.stop();
        await attachStudioPreviewStream(videoElement, currentPreviewStream);
        return false;
      }

      streamRef.current = nextPreviewStream;
      currentPreviewStream.getVideoTracks().forEach((track) => track.stop());
      return true;
    },
    []
  );

  const runPreviewAttempt = useCallback(async (isInitialAttempt = false) => {
    attemptIdRef.current += 1;
    const attemptId = attemptIdRef.current;
    const capabilityState = readStudioBrowserCapabilityState();

    if (isInitialAttempt) {
      initialBootstrapAttemptIdRef.current = attemptId;
    }

    cleanupStream();

    if (capabilityState !== "requestable") {
      settleInitialBootstrapPending(attemptId);
      setPreviewState(capabilityState === "unsupported" ? "unsupported" : "degraded");
      return;
    }

    setPreviewState("requesting");

    const timeoutId = window.setTimeout(() => {
      if (!isMountedRef.current || attemptIdRef.current !== attemptId) {
        return;
      }

      settleInitialBootstrapPending(attemptId);
      setPreviewState("timeout");
    }, PREVIEW_TIMEOUT_MS);

    const result = await requestStudioPreviewStream();
    window.clearTimeout(timeoutId);

    if (!isMountedRef.current || attemptIdRef.current !== attemptId) {
      if (result.kind === "success") {
        stopStudioPreviewStream(result.stream);
      }

      return;
    }

    if (result.kind !== "success") {
      settleInitialBootstrapPending(attemptId);
      setPreviewState(result.kind);
      return;
    }

    const videoElement = videoRef.current;

    if (!videoElement) {
      stopStudioPreviewStream(result.stream);
      settleInitialBootstrapPending(attemptId);
      setPreviewState("degraded");
      return;
    }

    const didAttach = await attachStudioPreviewStream(videoElement, result.stream);

    if (!isMountedRef.current || attemptIdRef.current !== attemptId) {
      stopStudioPreviewStream(result.stream);
      return;
    }

    if (!didAttach) {
      stopStudioPreviewStream(result.stream);
      settleInitialBootstrapPending(attemptId);
      setPreviewState("degraded");
      return;
    }

    streamRef.current = result.stream;
    settleInitialBootstrapPending(attemptId);
    setPreviewState("preview_ready");
  }, [cleanupStream, settleInitialBootstrapPending]);

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void runPreviewAttempt(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      isMountedRef.current = false;
      attemptIdRef.current += 1;
      initialBootstrapAttemptIdRef.current = null;
      cleanupStream();
    };
  }, [cleanupStream, runPreviewAttempt]);

  return {
    canRetry: isRetryableState(previewState),
    getPreviewStream,
    isInitialBootstrapPending,
    previewState,
    replacePreviewVideoTrack,
    retryPreview: runPreviewAttempt,
    videoRef
  };
}
