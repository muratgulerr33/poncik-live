"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";

import {
  connectStudioPublisherRoom,
  disconnectStudioPublisherRoom,
  fetchStudioPublisherToken,
  publishStudioPreviewTracks
} from "../_adapters/studio-livekit-publisher-adapter";
import {
  startStudioBroadcastLifecycle,
  stopStudioBroadcastLifecycle
} from "../_adapters/studio-lifecycle-client-adapter";
import { type StudioPreviewState } from "../_adapters/studio-preview-adapter";
import { STUDIO_COPY } from "../_lib/studio-copy";

type UseStudioPublishFoundationArgs = {
  lifecycleKind: "idle" | "live" | "degraded";
  previewState: StudioPreviewState;
  readPreviewStream: () => MediaStream | null;
};

type StudioLifecycleKind = UseStudioPublishFoundationArgs["lifecycleKind"];

export function useStudioPublishFoundation({
  lifecycleKind,
  previewState,
  readPreviewStream
}: UseStudioPublishFoundationArgs) {
  const router = useRouter();
  const roomRef = useRef<Room | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isLocallyLive, setIsLocallyLive] = useState(false);
  const [lifecycleMessage, setLifecycleMessage] = useState<string | null>(null);

  const effectiveLifecycleKind: StudioLifecycleKind =
    lifecycleKind === "live" || isLocallyLive ? "live" : lifecycleKind;

  const clearLocalPublisher = useCallback(async () => {
    const room = roomRef.current;

    roomRef.current = null;
    setIsLocallyLive(false);
    await disconnectStudioPublisherRoom(room);
  }, []);

  const startPublishing = useCallback(async () => {
    if (previewState !== "preview_ready" || lifecycleKind === "live" || isStarting) {
      return;
    }

    const previewStream = readPreviewStream();

    if (!previewStream) {
      setLifecycleMessage(STUDIO_COPY.startBroadcastError);
      return;
    }

    setIsStarting(true);
    setLifecycleMessage(null);

    const tokenResult = await fetchStudioPublisherToken();

    if (tokenResult.kind !== "success") {
      setLifecycleMessage(STUDIO_COPY.startBroadcastError);
      setIsStarting(false);
      return;
    }

    const connectionResult = await connectStudioPublisherRoom(tokenResult.payload);

    if (connectionResult.kind !== "success") {
      setLifecycleMessage(STUDIO_COPY.startBroadcastError);
      setIsStarting(false);
      return;
    }

    const didPublish = await publishStudioPreviewTracks(
      connectionResult.room,
      previewStream
    );

    if (!didPublish) {
      await disconnectStudioPublisherRoom(connectionResult.room);
      setLifecycleMessage(STUDIO_COPY.startBroadcastError);
      setIsStarting(false);
      return;
    }

    roomRef.current = connectionResult.room;

    const startResult = await startStudioBroadcastLifecycle();

    if (startResult.status === "error") {
      await clearLocalPublisher();
      setLifecycleMessage(startResult.message);
      setIsStarting(false);
      return;
    }

    setIsLocallyLive(true);
    setIsStarting(false);
    router.refresh();
  }, [
    clearLocalPublisher,
    isStarting,
    lifecycleKind,
    previewState,
    readPreviewStream,
    router
  ]);

  const stopPublishing = useCallback(async () => {
    if (
      (lifecycleKind !== "live" && !isLocallyLive) ||
      isStopping
    ) {
      return;
    }

    setIsStopping(true);
    setLifecycleMessage(null);

    const stopResult = await stopStudioBroadcastLifecycle();

    if (stopResult.status === "error") {
      setLifecycleMessage(stopResult.message);
      setIsStopping(false);
      return;
    }

    await clearLocalPublisher();
    setIsStopping(false);
    router.refresh();
  }, [clearLocalPublisher, isLocallyLive, isStopping, lifecycleKind, router]);

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
    isStarting,
    isStopping,
    lifecycleMessage,
    startPublishing,
    stopPublishing
  };
}
