"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";

import {
  bindStudioPublisherRoomDisconnect,
  connectStudioPublisherRoom,
  disconnectStudioPublisherRoom,
  fetchStudioPublisherToken,
  getStudioPublisherMicrophonePublication,
  publishStudioPreviewTracks,
  setStudioPublisherMicrophoneMuted
} from "../_adapters/studio-livekit-publisher-adapter";
import {
  setStudioPreviewMicrophoneMuted,
  type StudioPreviewState
} from "../_adapters/studio-preview-adapter";
import {
  startStudioBroadcastLifecycle,
  stopStudioBroadcastLifecycle,
  triggerStudioBroadcastCloseStop
} from "../_adapters/studio-lifecycle-client-adapter";
import { STUDIO_COPY } from "../_lib/studio-copy";

type UseStudioPublishFoundationArgs = {
  lifecycleKind: "idle" | "live" | "degraded";
  previewState: StudioPreviewState;
  readPreviewStream: () => MediaStream | null;
};

type StudioLifecycleKind = UseStudioPublishFoundationArgs["lifecycleKind"];

let latestStudioStartSuccessSequence = 0;

export function useStudioPublishFoundation({
  lifecycleKind,
  previewState,
  readPreviewStream
}: UseStudioPublishFoundationArgs) {
  const router = useRouter();
  const disconnectCleanupRef = useRef<(() => void) | null>(null);
  const closeStopFiredRef = useRef(false);
  const isLocallyLiveRef = useRef(false);
  const isStoppingRef = useRef(false);
  const roomRef = useRef<Room | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isLocallyLive, setIsLocallyLive] = useState(false);
  const [publisherRoom, setPublisherRoom] = useState<Room | null>(null);
  const [startSuccessSequence, setStartSuccessSequence] = useState(
    () => latestStudioStartSuccessSequence
  );
  const [lifecycleMessage, setLifecycleMessage] = useState<string | null>(null);

  const effectiveLifecycleKind: StudioLifecycleKind =
    lifecycleKind === "live" || isLocallyLive ? "live" : lifecycleKind;

  const clearRoomDisconnectBinding = useCallback(() => {
    disconnectCleanupRef.current?.();
    disconnectCleanupRef.current = null;
  }, []);

  const reportStartError = useCallback(() => {
    setLifecycleMessage(STUDIO_COPY.startBroadcastError);
  }, []);

  const getPublisherRoom = useCallback(() => roomRef.current, []);

  const clearLocalPublisher = useCallback(async () => {
    const room = roomRef.current;

    clearRoomDisconnectBinding();
    roomRef.current = null;
    setPublisherRoom(null);
    isLocallyLiveRef.current = false;
    setIsLocallyLive(false);
    await disconnectStudioPublisherRoom(room);
  }, [clearRoomDisconnectBinding]);

  const triggerCloseStop = useCallback(() => {
    if (
      !isLocallyLiveRef.current ||
      isStoppingRef.current ||
      closeStopFiredRef.current
    ) {
      return false;
    }

    closeStopFiredRef.current = true;
    triggerStudioBroadcastCloseStop();
    return true;
  }, []);

  const startPublishing = useCallback(async ({
    initialMicMuted
  }: {
    initialMicMuted: boolean;
  }) => {
    if (previewState !== "preview_ready" || lifecycleKind === "live" || isStarting) {
      return;
    }

    setIsStarting(true);
    setLifecycleMessage(null);

    const previewStream = readPreviewStream();

    if (!previewStream) {
      reportStartError();
      setIsStarting(false);
      return;
    }

    if (!setStudioPreviewMicrophoneMuted(previewStream, initialMicMuted)) {
      reportStartError();
      setIsStarting(false);
      return;
    }

    const tokenResult = await fetchStudioPublisherToken();

    if (tokenResult.kind !== "success") {
      reportStartError();
      setIsStarting(false);
      return;
    }

    const connectionResult = await connectStudioPublisherRoom(tokenResult.payload);

    if (connectionResult.kind !== "success") {
      reportStartError();
      setIsStarting(false);
      return;
    }

    const didPublish = await publishStudioPreviewTracks(
      connectionResult.room,
      previewStream
    );

    if (!didPublish) {
      await disconnectStudioPublisherRoom(connectionResult.room);
      reportStartError();
      setIsStarting(false);
      return;
    }

    if (!getStudioPublisherMicrophonePublication(connectionResult.room)) {
      await disconnectStudioPublisherRoom(connectionResult.room);
      reportStartError();
      setIsStarting(false);
      return;
    }

    const didNormalizePublication = await setStudioPublisherMicrophoneMuted(
      connectionResult.room,
      initialMicMuted
    );

    if (!didNormalizePublication) {
      await disconnectStudioPublisherRoom(connectionResult.room);
      reportStartError();
      setIsStarting(false);
      return;
    }

    roomRef.current = connectionResult.room;
    setPublisherRoom(connectionResult.room);

    const startResult = await startStudioBroadcastLifecycle();

    if (startResult.status === "error") {
      await clearLocalPublisher();
      setLifecycleMessage(startResult.message);
      setIsStarting(false);
      return;
    }

    closeStopFiredRef.current = false;
    isLocallyLiveRef.current = true;
    setIsLocallyLive(true);
    latestStudioStartSuccessSequence += 1;
    setStartSuccessSequence(latestStudioStartSuccessSequence);
    setIsStarting(false);
    router.refresh();
  }, [
    clearLocalPublisher,
    isStarting,
    lifecycleKind,
    previewState,
    readPreviewStream,
    reportStartError,
    router
  ]);

  const stopPublishing = useCallback(async () => {
    if ((lifecycleKind !== "live" && !isLocallyLive) || isStopping) {
      return false;
    }

    setIsStopping(true);
    isStoppingRef.current = true;
    closeStopFiredRef.current = true;
    setLifecycleMessage(null);

    const stopResult = await stopStudioBroadcastLifecycle();

    if (stopResult.status === "error") {
      setLifecycleMessage(stopResult.message);
      setIsStopping(false);
      isStoppingRef.current = false;
      closeStopFiredRef.current = false;
      return false;
    }

    await clearLocalPublisher();
    setIsStopping(false);
    isStoppingRef.current = false;
    router.refresh();
    return true;
  }, [
    clearLocalPublisher,
    isLocallyLive,
    isStopping,
    lifecycleKind,
    router
  ]);

  useEffect(() => {
    const room = roomRef.current;

    if (!room) {
      clearRoomDisconnectBinding();
      return;
    }

    const binding = bindStudioPublisherRoomDisconnect(room, () => {
      if (!triggerCloseStop()) {
        return;
      }

      void clearLocalPublisher();
      router.refresh();
    });

    disconnectCleanupRef.current = binding.cleanup;

    return () => {
      if (disconnectCleanupRef.current === binding.cleanup) {
        clearRoomDisconnectBinding();
      } else {
        binding.cleanup();
      }
    };
  }, [
    clearLocalPublisher,
    clearRoomDisconnectBinding,
    isLocallyLive,
    router,
    triggerCloseStop
  ]);

  useEffect(() => {
    return () => {
      void disconnectStudioPublisherRoom(roomRef.current);
      roomRef.current = null;
    };
  }, []);

  return {
    canStart: previewState === "preview_ready" && effectiveLifecycleKind !== "live" && !isStarting,
    canStop: effectiveLifecycleKind === "live" && !isStopping,
    effectiveLifecycleKind,
    getPublisherRoom,
    isStarting,
    isStopping,
    lifecycleMessage,
    publisherRoom,
    reportStartError,
    startSuccessSequence,
    startPublishing,
    stopPublishing
  };
}
