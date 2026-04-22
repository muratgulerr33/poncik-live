"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoomEvent, Track, type Room } from "livekit-client";

import {
  requestStudioTargetedCameraStream,
  readStudioViableCameraDevices,
  stopStudioPreviewStream,
  type StudioViableCameraDevice
} from "../_adapters/studio-preview-adapter";
import { replaceStudioPublisherCameraTrack } from "../_adapters/studio-livekit-publisher-adapter";
import type { StudioLiveCameraSwitchControl } from "./StudioTopChrome";

type StudioLiveCameraSwitchSurfaceArgs = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  getPreviewStream: () => MediaStream | null;
  getPublisherRoom: () => Room | null;
  replacePreviewStream: (nextStream: MediaStream) => Promise<boolean>;
}>;

type AuthoritativeLiveCameraState = Readonly<{
  currentDeviceId: string | null;
  isAvailable: boolean;
  viableDevices: readonly StudioViableCameraDevice[];
}>;

const DEFAULT_LIVE_CAMERA_STATE: AuthoritativeLiveCameraState = {
  currentDeviceId: null,
  isAvailable: false,
  viableDevices: []
};

function getNextCameraDevice(
  currentDeviceId: string,
  viableDevices: readonly StudioViableCameraDevice[]
) {
  if (viableDevices.length <= 1) {
    return null;
  }

  const currentIndex = viableDevices.findIndex((device) => device.deviceId === currentDeviceId);

  if (currentIndex === -1) {
    return null;
  }

  return viableDevices[(currentIndex + 1) % viableDevices.length] ?? null;
}

export function useStudioLiveCameraSwitchSurface({
  effectiveLifecycleKind,
  getPreviewStream,
  getPublisherRoom,
  replacePreviewStream
}: StudioLiveCameraSwitchSurfaceArgs) {
  const [authoritativeLiveCameraState, setAuthoritativeLiveCameraState] =
    useState<AuthoritativeLiveCameraState>(DEFAULT_LIVE_CAMERA_STATE);
  const [isPending, setIsPending] = useState(false);
  const syncRequestIdRef = useRef(0);

  const syncFromAuthoritativeLiveCameraPath = useCallback(async () => {
    const requestId = syncRequestIdRef.current + 1;
    syncRequestIdRef.current = requestId;

    if (effectiveLifecycleKind !== "live") {
      if (syncRequestIdRef.current === requestId) {
        setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      }

      return DEFAULT_LIVE_CAMERA_STATE;
    }

    const room = getPublisherRoom();
    const previewStream = getPreviewStream();

    if (!room || !previewStream) {
      if (syncRequestIdRef.current === requestId) {
        setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      }

      return DEFAULT_LIVE_CAMERA_STATE;
    }

    const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
    const videoTrack = publication?.videoTrack;

    if (!videoTrack) {
      if (syncRequestIdRef.current === requestId) {
        setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      }

      return DEFAULT_LIVE_CAMERA_STATE;
    }

    const currentDeviceId =
      (await videoTrack.getDeviceId(false)) ??
      videoTrack.mediaStreamTrack.getSettings().deviceId ??
      null;

    if (!currentDeviceId) {
      if (syncRequestIdRef.current === requestId) {
        setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      }

      return DEFAULT_LIVE_CAMERA_STATE;
    }

    const viableDevices = await readStudioViableCameraDevices({
      activeDeviceId: currentDeviceId
    });
    const isCurrentDeviceViable = viableDevices.some(
      (device) => device.deviceId === currentDeviceId
    );
    const nextState: AuthoritativeLiveCameraState = isCurrentDeviceViable
      ? {
          currentDeviceId,
          isAvailable: viableDevices.length > 1,
          viableDevices
        }
      : DEFAULT_LIVE_CAMERA_STATE;

    if (syncRequestIdRef.current === requestId) {
      setAuthoritativeLiveCameraState(nextState);
    }

    return nextState;
  }, [effectiveLifecycleKind, getPreviewStream, getPublisherRoom]);

  const handleSwitch = useCallback(async () => {
    if (isPending || effectiveLifecycleKind !== "live") {
      return;
    }

    const previewStream = getPreviewStream();
    const room = getPublisherRoom();
    const previousPreviewVideoTrack = previewStream?.getVideoTracks()[0] ?? null;

    if (!previewStream || !room || !previousPreviewVideoTrack) {
      return;
    }

    const currentState = await syncFromAuthoritativeLiveCameraPath();

    if (!currentState.isAvailable || !currentState.currentDeviceId) {
      return;
    }

    const nextCameraDevice = getNextCameraDevice(
      currentState.currentDeviceId,
      currentState.viableDevices
    );

    if (!nextCameraDevice) {
      return;
    }

    setIsPending(true);

    let shouldSyncAuthoritativeState = true;

    try {
      const targetedStreamResult = await requestStudioTargetedCameraStream({
        deviceId: nextCameraDevice.deviceId
      });

      if (targetedStreamResult.kind !== "success") {
        return;
      }

      const acquiredStream = targetedStreamResult.stream;
      const acquiredVideoTrack = acquiredStream.getVideoTracks()[0] ?? null;

      if (!acquiredVideoTrack) {
        stopStudioPreviewStream(acquiredStream);
        return;
      }

      const replaceResult = await replaceStudioPublisherCameraTrack(room, acquiredVideoTrack);

      if (replaceResult.kind !== "success") {
        stopStudioPreviewStream(acquiredStream);
        return;
      }

      const replacementStream = new MediaStream([
        replaceResult.mediaStreamTrack,
        ...previewStream.getAudioTracks()
      ]);

      const didReplacePreview = await replacePreviewStream(replacementStream);

      if (didReplacePreview) {
        return;
      }

      if (previousPreviewVideoTrack.readyState !== "live") {
        shouldSyncAuthoritativeState = false;

        throw new Error(
          "Studio camera switch contract risk: preview replacement failed after live camera mutation and safe rollback is unavailable within the current boundary."
        );
      }

      const rollbackResult = await replaceStudioPublisherCameraTrack(
        room,
        previousPreviewVideoTrack
      );

      if (rollbackResult.kind !== "success" || rollbackResult.mediaStreamTrack !== previousPreviewVideoTrack) {
        shouldSyncAuthoritativeState = false;

        throw new Error(
          "Studio camera switch contract risk: preview replacement failed and safe rollback could not be proven within the current boundary."
        );
      }

      stopStudioPreviewStream(acquiredStream);
    } finally {
      if (shouldSyncAuthoritativeState) {
        await syncFromAuthoritativeLiveCameraPath();
      }

      setIsPending(false);
    }
  }, [
    effectiveLifecycleKind,
    getPreviewStream,
    getPublisherRoom,
    isPending,
    replacePreviewStream,
    syncFromAuthoritativeLiveCameraPath
  ]);

  useEffect(() => {
    if (effectiveLifecycleKind !== "live") {
      setIsPending(false);
      setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      return;
    }

    const room = getPublisherRoom();

    if (!room) {
      setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
      return;
    }

    function handleLiveCameraPathChange() {
      void syncFromAuthoritativeLiveCameraPath();
    }

    function handleDisconnected() {
      setIsPending(false);
      setAuthoritativeLiveCameraState(DEFAULT_LIVE_CAMERA_STATE);
    }

    void syncFromAuthoritativeLiveCameraPath();

    room
      .on(RoomEvent.LocalTrackPublished, handleLiveCameraPathChange)
      .on(RoomEvent.LocalTrackUnpublished, handleLiveCameraPathChange)
      .on(RoomEvent.Disconnected, handleDisconnected);

    navigator.mediaDevices?.addEventListener?.("devicechange", handleLiveCameraPathChange);

    return () => {
      room
        .off(RoomEvent.LocalTrackPublished, handleLiveCameraPathChange)
        .off(RoomEvent.LocalTrackUnpublished, handleLiveCameraPathChange)
        .off(RoomEvent.Disconnected, handleDisconnected);

      navigator.mediaDevices?.removeEventListener?.("devicechange", handleLiveCameraPathChange);
    };
  }, [effectiveLifecycleKind, getPublisherRoom, syncFromAuthoritativeLiveCameraPath]);

  const liveCameraSwitchControl = useMemo<StudioLiveCameraSwitchControl | null>(() => {
    if (effectiveLifecycleKind !== "live" || !authoritativeLiveCameraState.isAvailable) {
      return null;
    }

    return {
      isPending,
      onSwitch: () => {
        void handleSwitch();
      }
    };
  }, [authoritativeLiveCameraState.isAvailable, effectiveLifecycleKind, handleSwitch, isPending]);

  return {
    liveCameraSwitchControl
  };
}
