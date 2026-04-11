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
  const isMountedRef = useRef(false);
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

  const runPreviewAttempt = useCallback(async () => {
    attemptIdRef.current += 1;
    const attemptId = attemptIdRef.current;
    const capabilityState = readStudioBrowserCapabilityState();

    cleanupStream();

    if (capabilityState !== "requestable") {
      setPreviewState(capabilityState === "unsupported" ? "unsupported" : "degraded");
      return;
    }

    setPreviewState("requesting");

    const timeoutId = window.setTimeout(() => {
      if (!isMountedRef.current || attemptIdRef.current !== attemptId) {
        return;
      }

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
      setPreviewState(result.kind);
      return;
    }

    const videoElement = videoRef.current;

    if (!videoElement) {
      stopStudioPreviewStream(result.stream);
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
      setPreviewState("degraded");
      return;
    }

    streamRef.current = result.stream;
    setPreviewState("preview_ready");
  }, [cleanupStream]);

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void runPreviewAttempt();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      isMountedRef.current = false;
      attemptIdRef.current += 1;
      cleanupStream();
    };
  }, [cleanupStream, runPreviewAttempt]);

  return {
    canRetry: isRetryableState(previewState),
    getPreviewStream: () => streamRef.current,
    previewState,
    retryPreview: runPreviewAttempt,
    videoRef
  };
}
