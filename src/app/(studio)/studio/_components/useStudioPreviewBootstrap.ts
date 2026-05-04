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

type StudioPreviewCameraSwitchBeforeCurrentVideoStopInput = {
  currentStream: MediaStream;
  currentVideoTrack: MediaStreamTrack;
  targetDeviceId: string;
};

type StudioPreviewCameraSwitchAfterNextVideoAttachBeforeCommitInput = {
  nextStream: MediaStream;
  nextVideoStream: MediaStream;
  nextVideoTrack: MediaStreamTrack;
  targetDeviceId: string;
};

type StudioPreviewCameraSwitchAfterNextVideoCommitAbortedInput = {
  nextVideoTrack: MediaStreamTrack;
  targetDeviceId: string;
};

export type StudioPreviewCameraSwitchCallbacks = {
  beforeCurrentVideoStop?: (
    input: StudioPreviewCameraSwitchBeforeCurrentVideoStopInput
  ) => Promise<boolean>;
  afterNextVideoAttachBeforeCommit?: (
    input: StudioPreviewCameraSwitchAfterNextVideoAttachBeforeCommitInput
  ) => Promise<boolean>;
  afterNextVideoCommitAborted?: (
    input: StudioPreviewCameraSwitchAfterNextVideoCommitAbortedInput
  ) => Promise<void>;
};

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

  const switchPreviewCamera = useCallback(async (
    callbacks?: StudioPreviewCameraSwitchCallbacks
  ) => {
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

      const currentVideoTrack =
        currentStream
          .getVideoTracks()
          .find((track) => track.readyState !== "ended") ?? null;

      if (!currentVideoTrack) {
        return false;
      }

      if (callbacks?.beforeCurrentVideoStop) {
        const didPrepareCurrentTrack = await callbacks.beforeCurrentVideoStop({
          currentStream,
          currentVideoTrack,
          targetDeviceId: targetDevice.deviceId
        });

        if (!didPrepareCurrentTrack) {
          return false;
        }
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

      const nextVideoTrack =
        nextVideoStream
          .getVideoTracks()
          .find((track) => track.readyState !== "ended") ?? null;

      if (!nextVideoTrack) {
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
        stopStudioMediaStream(nextVideoStream);
        clearPreviewElementTarget(videoElement);
        return false;
      }

      if (callbacks?.afterNextVideoAttachBeforeCommit) {
        const didPrepareNextTrack =
          await callbacks.afterNextVideoAttachBeforeCommit({
            nextStream,
            nextVideoStream,
            nextVideoTrack,
            targetDeviceId: targetDevice.deviceId
          });

        if (!didPrepareNextTrack) {
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
      }

      if (
        !isMountedRef.current ||
        attemptIdRef.current !== switchAttemptId
      ) {
        try {
          await callbacks?.afterNextVideoCommitAborted?.({
            nextVideoTrack,
            targetDeviceId: targetDevice.deviceId
          });
        } catch {
          // Best-effort orphan cleanup only.
        }

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
