"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readStudioBrowserCapabilityState } from "../_adapters/studio-browser-capability-adapter";
import {
  createStudioStreamWithReplacedVideo,
  readStudioActiveVideoDeviceId,
  readStudioVideoInputDevices,
  requestStudioCameraStreamByDeviceId,
  resolveStudioNextCameraDevice,
  stopStudioMediaStream,
  stopStudioVideoTracks,
  waitStudioCameraReleaseSettle
} from "../_adapters/studio-camera-device-adapter";
import {
  attachStudioPreviewStream,
  requestStudioPreviewStream,
  stopStudioPreviewStream,
  type StudioPreviewState
} from "../_adapters/studio-preview-adapter";

const PREVIEW_TIMEOUT_MS = 12000;

function clearPreviewElementTarget(videoElement: HTMLVideoElement | null) {
  if (!videoElement) {
    return;
  }

  videoElement.pause();
  videoElement.srcObject = null;
}

export function useStudioPreviewBootstrap() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const attemptIdRef = useRef(0);
  const initialBootstrapAttemptIdRef = useRef<number | null>(null);
  const isCameraSwitchPendingRef = useRef(false);
  const isMountedRef = useRef(false);
  const [isCameraSwitchPending, setIsCameraSwitchPending] = useState(false);
  const [isInitialBootstrapPending, setIsInitialBootstrapPending] = useState(true);
  const [previewState, setPreviewState] = useState<StudioPreviewState>("requesting");

  function isRetryableState(state: StudioPreviewState) {
    return state === "blocked" || state === "timeout" || state === "degraded";
  }

  const clearPreviewElement = useCallback(() => {
    clearPreviewElementTarget(videoRef.current);
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

  const switchPreviewCamera = useCallback(async () => {
    if (isCameraSwitchPendingRef.current) {
      return false;
    }

    const currentStream = streamRef.current;
    const videoElement = videoRef.current;

    if (!currentStream || !videoElement) {
      return false;
    }

    isCameraSwitchPendingRef.current = true;
    setIsCameraSwitchPending(true);
    attemptIdRef.current += 1;
    const switchAttemptId = attemptIdRef.current;
    let shouldClearPendingState = true;

    try {
      const devicesResult = await readStudioVideoInputDevices();

      if (devicesResult.kind !== "success") {
        return false;
      }

      if (devicesResult.devices.length < 2) {
        return false;
      }

      const currentDeviceId = readStudioActiveVideoDeviceId(currentStream);
      const targetDevice = resolveStudioNextCameraDevice(
        devicesResult.devices,
        currentDeviceId
      );

      if (!targetDevice) {
        return false;
      }

      stopStudioVideoTracks(currentStream);
      await waitStudioCameraReleaseSettle();

      const requestResult = await requestStudioCameraStreamByDeviceId({
        deviceId: targetDevice.deviceId,
        includeAudio: false
      });

      if (requestResult.kind !== "success") {
        if (
          isMountedRef.current &&
          attemptIdRef.current === switchAttemptId
        ) {
          setPreviewState(
            requestResult.kind === "blocked"
              ? "blocked"
              : requestResult.kind === "unsupported"
                ? "unsupported"
                : "degraded"
          );
        }

        return false;
      }

      const nextVideoStream = requestResult.stream;
      const nextStream = createStudioStreamWithReplacedVideo({
        currentStream,
        nextVideoStream
      });
      const didAttach = await attachStudioPreviewStream(videoElement, nextStream);

      if (!didAttach) {
        stopStudioMediaStream(nextVideoStream);
        clearPreviewElementTarget(videoElement);

        if (
          isMountedRef.current &&
          attemptIdRef.current === switchAttemptId
        ) {
          setPreviewState("degraded");
        }

        return false;
      }

      if (
        !isMountedRef.current ||
        attemptIdRef.current !== switchAttemptId
      ) {
        shouldClearPendingState = false;
        stopStudioMediaStream(nextVideoStream);
        clearPreviewElementTarget(videoElement);
        return false;
      }

      streamRef.current = nextStream;
      settleInitialBootstrapPending(switchAttemptId);
      setPreviewState("preview_ready");
      return true;
    } finally {
      isCameraSwitchPendingRef.current = false;

      if (
        shouldClearPendingState &&
        isMountedRef.current &&
        attemptIdRef.current === switchAttemptId
      ) {
        setIsCameraSwitchPending(false);
      }
    }
  }, [settleInitialBootstrapPending]);

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void runPreviewAttempt(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      isCameraSwitchPendingRef.current = false;
      isMountedRef.current = false;
      attemptIdRef.current += 1;
      initialBootstrapAttemptIdRef.current = null;
      cleanupStream();
    };
  }, [cleanupStream, runPreviewAttempt]);

  return {
    canRetry: isRetryableState(previewState),
    getPreviewStream,
    isCameraSwitchPending,
    isInitialBootstrapPending,
    previewState,
    retryPreview: runPreviewAttempt,
    switchPreviewCamera,
    videoRef
  };
}
