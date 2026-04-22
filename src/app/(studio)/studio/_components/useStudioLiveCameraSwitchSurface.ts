"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LocalTrackPublication } from "livekit-client";

import type { StudioPublisherLiveVideoSwitchAttemptResult } from "../_adapters/studio-livekit-publisher-adapter";
import type { StudioLiveCameraControl } from "./StudioTopChrome";

type UseStudioLiveCameraSwitchSurfaceArgs = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  readActiveLiveVideoPublication: () => LocalTrackPublication | null;
  readPreviewStream: () => MediaStream | null;
  readPreviewVideoElement: () => HTMLVideoElement | null;
  switchActiveLiveVideo: (
    deviceId: string
  ) => Promise<StudioPublisherLiveVideoSwitchAttemptResult>;
}>;

export type StudioLiveCameraSwitchResult =
  | StudioPublisherLiveVideoSwitchAttemptResult
  | {
      kind: "busy";
    }
  | {
      kind: "guarded";
    }
  | {
      kind: "preview_failed";
    };

type CameraSwitchabilityState = Readonly<{
  currentAnchorDeviceId: string | null;
  eligibleCameraDeviceIds: string[];
  canRenderControl: boolean;
}>;

const DEFAULT_CAMERA_SWITCHABILITY_STATE: CameraSwitchabilityState = {
  currentAnchorDeviceId: null,
  eligibleCameraDeviceIds: [],
  canRenderControl: false
};

function readTrackDeviceId(track: MediaStreamTrack | null | undefined) {
  const deviceId = track?.getSettings().deviceId;

  return typeof deviceId === "string" && deviceId.length > 0 ? deviceId : null;
}

function readCurrentLiveCameraAnchor(publication: LocalTrackPublication | null) {
  const deviceId = publication?.videoTrack?.getSourceTrackSettings().deviceId;

  if (typeof deviceId === "string" && deviceId.length > 0) {
    return deviceId;
  }

  return readTrackDeviceId(publication?.videoTrack?.mediaStreamTrack);
}

function readCurrentPreviewCameraAnchor(stream: MediaStream | null) {
  return readTrackDeviceId(stream?.getVideoTracks()[0]);
}

function isEligibleCameraDevice(device: MediaDeviceInfo) {
  return device.kind === "videoinput" && device.deviceId.length > 0;
}

async function readEligibleCameraDeviceIds() {
  if (
    typeof window === "undefined" ||
    !("mediaDevices" in navigator) ||
    typeof navigator.mediaDevices?.enumerateDevices !== "function"
  ) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices.filter(isEligibleCameraDevice).map((device) => device.deviceId);
}

function resolveCurrentAnchorDeviceId(
  publication: LocalTrackPublication | null,
  previewStream: MediaStream | null
) {
  return (
    readCurrentLiveCameraAnchor(publication) ??
    readCurrentPreviewCameraAnchor(previewStream)
  );
}

function getNextEligibleCameraDeviceId(
  eligibleCameraDeviceIds: string[],
  currentAnchorDeviceId: string | null
) {
  if (!currentAnchorDeviceId || eligibleCameraDeviceIds.length < 2) {
    return null;
  }

  const currentIndex = eligibleCameraDeviceIds.findIndex(
    (deviceId) => deviceId === currentAnchorDeviceId
  );

  if (currentIndex < 0) {
    return null;
  }

  return (
    eligibleCameraDeviceIds[(currentIndex + 1) % eligibleCameraDeviceIds.length] ?? null
  );
}

function canRenderCameraControl(
  eligibleCameraDeviceIds: string[],
  currentAnchorDeviceId: string | null
) {
  return (
    currentAnchorDeviceId !== null &&
    eligibleCameraDeviceIds.length >= 2 &&
    eligibleCameraDeviceIds.includes(currentAnchorDeviceId)
  );
}

function areEligibleCameraDeviceIdsEqual(
  previousEligibleCameraDeviceIds: readonly string[],
  nextEligibleCameraDeviceIds: readonly string[]
) {
  if (previousEligibleCameraDeviceIds.length !== nextEligibleCameraDeviceIds.length) {
    return false;
  }

  return previousEligibleCameraDeviceIds.every(
    (deviceId, index) => deviceId === nextEligibleCameraDeviceIds[index]
  );
}

function areCameraSwitchabilityStatesEqual(
  previousState: CameraSwitchabilityState,
  nextState: CameraSwitchabilityState
) {
  return (
    previousState.currentAnchorDeviceId === nextState.currentAnchorDeviceId &&
    previousState.canRenderControl === nextState.canRenderControl &&
    areEligibleCameraDeviceIdsEqual(
      previousState.eligibleCameraDeviceIds,
      nextState.eligibleCameraDeviceIds
    )
  );
}

async function acquirePreviewCandidateVideoTrack(deviceId: string) {
  try {
    if (
      typeof window === "undefined" ||
      !("mediaDevices" in navigator) ||
      typeof navigator.mediaDevices?.getUserMedia !== "function"
    ) {
      return null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: {
          exact: deviceId
        }
      }
    });
    const track = stream.getVideoTracks()[0];

    if (!track) {
      stream.getTracks().forEach((mediaTrack) => mediaTrack.stop());
      return null;
    }

    return track;
  } catch {
    return null;
  }
}

async function commitPreviewCameraCatchup(
  deviceId: string,
  readPreviewStream: () => MediaStream | null,
  readPreviewVideoElement: () => HTMLVideoElement | null
) {
  const previewStream = readPreviewStream();

  if (!previewStream) {
    return {
      kind: "preview_failed"
    } as const;
  }

  const candidateTrack = await acquirePreviewCandidateVideoTrack(deviceId);

  if (!candidateTrack) {
    return {
      kind: "preview_failed"
    } as const;
  }

  const previousVideoTrack = previewStream.getVideoTracks()[0] ?? null;

  try {
    if (previousVideoTrack && previousVideoTrack !== candidateTrack) {
      previewStream.removeTrack(previousVideoTrack);
    }

    if (!previewStream.getVideoTracks().includes(candidateTrack)) {
      previewStream.addTrack(candidateTrack);
    }

    const previewVideoElement = readPreviewVideoElement();

    if (previewVideoElement) {
      previewVideoElement.muted = true;
      previewVideoElement.playsInline = true;
      previewVideoElement.autoplay = true;

      if (previewVideoElement.srcObject !== previewStream) {
        previewVideoElement.srcObject = previewStream;
      }

      void previewVideoElement.play().catch(() => undefined);
    }

    const committedDeviceId = readCurrentPreviewCameraAnchor(previewStream);

    if (committedDeviceId !== deviceId) {
      candidateTrack.stop();
      return {
        kind: "preview_failed"
      } as const;
    }

    if (previousVideoTrack && previousVideoTrack !== candidateTrack) {
      previousVideoTrack.stop();
    }

    return {
      kind: "success"
    } as const;
  } catch {
    candidateTrack.stop();
    return {
      kind: "preview_failed"
    } as const;
  }
}

export function useStudioLiveCameraSwitchSurface({
  effectiveLifecycleKind,
  readActiveLiveVideoPublication,
  readPreviewStream,
  readPreviewVideoElement,
  switchActiveLiveVideo
}: UseStudioLiveCameraSwitchSurfaceArgs) {
  const [cameraSwitchabilityState, setCameraSwitchabilityState] =
    useState<CameraSwitchabilityState>(DEFAULT_CAMERA_SWITCHABILITY_STATE);
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const effectiveLifecycleKindRef = useRef(effectiveLifecycleKind);
  const latestCameraSwitchabilityStateRef = useRef(cameraSwitchabilityState);
  const latestInputsRef = useRef({
    readActiveLiveVideoPublication,
    readPreviewStream,
    readPreviewVideoElement,
    switchActiveLiveVideo
  });

  useEffect(() => {
    effectiveLifecycleKindRef.current = effectiveLifecycleKind;
  }, [effectiveLifecycleKind]);

  useEffect(() => {
    latestInputsRef.current = {
      readActiveLiveVideoPublication,
      readPreviewStream,
      readPreviewVideoElement,
      switchActiveLiveVideo
    };
  }, [
    readActiveLiveVideoPublication,
    readPreviewStream,
    readPreviewVideoElement,
    switchActiveLiveVideo
  ]);

  const commitCameraSwitchabilityState = useCallback(
    (nextState: CameraSwitchabilityState) => {
      if (
        areCameraSwitchabilityStatesEqual(
          latestCameraSwitchabilityStateRef.current,
          nextState
        )
      ) {
        return false;
      }

      latestCameraSwitchabilityStateRef.current = nextState;
      setCameraSwitchabilityState(nextState);
      return true;
    },
    []
  );

  const refreshCameraSwitchability = useCallback(async () => {
    if (effectiveLifecycleKindRef.current !== "live") {
      commitCameraSwitchabilityState(DEFAULT_CAMERA_SWITCHABILITY_STATE);
      return;
    }

    const eligibleCameraDeviceIds = await readEligibleCameraDeviceIds();
    const {
      readActiveLiveVideoPublication: readLivePublication,
      readPreviewStream: readPreviewMediaStream
    } = latestInputsRef.current;
    const currentAnchorDeviceId = resolveCurrentAnchorDeviceId(
      readLivePublication(),
      readPreviewMediaStream()
    );

    if (effectiveLifecycleKindRef.current !== "live") {
      commitCameraSwitchabilityState(DEFAULT_CAMERA_SWITCHABILITY_STATE);
      return;
    }

    commitCameraSwitchabilityState({
      currentAnchorDeviceId,
      eligibleCameraDeviceIds,
      canRenderControl: canRenderCameraControl(
        eligibleCameraDeviceIds,
        currentAnchorDeviceId
      )
    });
  }, [commitCameraSwitchabilityState]);

  useEffect(() => {
    void refreshCameraSwitchability();
  }, [effectiveLifecycleKind, refreshCameraSwitchability]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("mediaDevices" in navigator) ||
      typeof navigator.mediaDevices?.addEventListener !== "function"
    ) {
      return;
    }

    function handleDeviceChange() {
      void refreshCameraSwitchability();
    }

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [refreshCameraSwitchability]);

  useEffect(() => {
    if (effectiveLifecycleKind === "live") {
      return;
    }

    isPendingRef.current = false;
    setIsPending(false);
  }, [effectiveLifecycleKind]);

  const switchCamera = useCallback(async (): Promise<StudioLiveCameraSwitchResult> => {
    if (isPendingRef.current) {
      return {
        kind: "busy"
      };
    }

    const {
      canRenderControl,
      currentAnchorDeviceId,
      eligibleCameraDeviceIds
    } = latestCameraSwitchabilityStateRef.current;
    const nextDeviceId = getNextEligibleCameraDeviceId(
      eligibleCameraDeviceIds,
      currentAnchorDeviceId
    );

    if (!canRenderControl || !nextDeviceId) {
      return {
        kind: "guarded"
      };
    }

    isPendingRef.current = true;
    setIsPending(true);

    try {
      const {
        readPreviewStream: readPreviewMediaStream,
        readPreviewVideoElement: readPreviewElement,
        switchActiveLiveVideo: switchLiveVideo
      } = latestInputsRef.current;
      const switchResult = await switchLiveVideo(nextDeviceId);

      if (switchResult.kind !== "success") {
        return switchResult;
      }

      const previewCatchupResult = await commitPreviewCameraCatchup(
        nextDeviceId,
        readPreviewMediaStream,
        readPreviewElement
      );

      if (previewCatchupResult.kind !== "success") {
        await refreshCameraSwitchability();
        return previewCatchupResult;
      }

      await refreshCameraSwitchability();

      return {
        kind: "success"
      };
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }, [refreshCameraSwitchability]);

  const handleSwitch = useCallback(() => {
    void switchCamera();
  }, [switchCamera]);

  const liveCameraControl = useMemo<StudioLiveCameraControl | null>(() => {
    if (!cameraSwitchabilityState.canRenderControl) {
      return null;
    }

    return {
      isPending,
      onSwitch: handleSwitch
    };
  }, [cameraSwitchabilityState.canRenderControl, handleSwitch, isPending]);

  return {
    isPending,
    liveCameraControl,
    switchCamera
  };
}
