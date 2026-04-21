"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RoomEvent,
  Track,
  type LocalParticipant,
  type LocalTrackPublication,
  type Participant,
  type Room,
  type TrackPublication
} from "livekit-client";

import type { StudioLiveMicControl } from "./StudioTopChrome";

type StudioLiveMicUtilitySurfaceArgs = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  getPublisherRoom: () => Room | null;
}>;

type AuthoritativeLiveMicState = {
  isAvailable: boolean;
  isMuted: boolean;
};

const DEFAULT_LIVE_MIC_STATE: AuthoritativeLiveMicState = {
  isAvailable: false,
  isMuted: false
};

export function useStudioLiveMicUtilitySurface({
  effectiveLifecycleKind,
  getPublisherRoom
}: StudioLiveMicUtilitySurfaceArgs) {
  const [authoritativeLiveMicState, setAuthoritativeLiveMicState] =
    useState<AuthoritativeLiveMicState>(DEFAULT_LIVE_MIC_STATE);
  const [isPending, setIsPending] = useState(false);

  const syncFromAuthoritativeLiveMicPath = useCallback(() => {
    const room = getPublisherRoom();

    if (!room || effectiveLifecycleKind !== "live") {
      setAuthoritativeLiveMicState(DEFAULT_LIVE_MIC_STATE);
      return null;
    }

    const publication = room.localParticipant.getTrackPublication(Track.Source.Microphone);

    if (!publication?.track) {
      setAuthoritativeLiveMicState(DEFAULT_LIVE_MIC_STATE);
      return null;
    }

    setAuthoritativeLiveMicState({
      isAvailable: true,
      isMuted: publication.isMuted
    });

    return publication;
  }, [effectiveLifecycleKind, getPublisherRoom]);

  const handleToggle = useCallback(async () => {
    if (isPending || effectiveLifecycleKind !== "live") {
      return;
    }

    const publication = syncFromAuthoritativeLiveMicPath();

    if (!publication) {
      return;
    }

    setIsPending(true);

    try {
      if (publication.isMuted) {
        await publication.unmute();
      } else {
        await publication.mute();
      }
    } finally {
      syncFromAuthoritativeLiveMicPath();
      setIsPending(false);
    }
  }, [effectiveLifecycleKind, isPending, syncFromAuthoritativeLiveMicPath]);

  useEffect(() => {
    if (effectiveLifecycleKind !== "live") {
      setIsPending(false);
      setAuthoritativeLiveMicState(DEFAULT_LIVE_MIC_STATE);
      return;
    }

    const room = getPublisherRoom();

    if (!room) {
      setAuthoritativeLiveMicState(DEFAULT_LIVE_MIC_STATE);
      return;
    }

    function handleTrackMuteChange(
      publication: TrackPublication,
      participant: Participant
    ) {
      if (!participant.isLocal || publication.source !== Track.Source.Microphone) {
        return;
      }

      syncFromAuthoritativeLiveMicPath();
    }

    function handleLocalPublicationChange(
      publication: LocalTrackPublication,
      participant: LocalParticipant
    ) {
      if (!participant.isLocal || publication.source !== Track.Source.Microphone) {
        return;
      }

      syncFromAuthoritativeLiveMicPath();
    }

    function handleDisconnected() {
      setIsPending(false);
      setAuthoritativeLiveMicState(DEFAULT_LIVE_MIC_STATE);
    }

    syncFromAuthoritativeLiveMicPath();

    room
      .on(RoomEvent.TrackMuted, handleTrackMuteChange)
      .on(RoomEvent.TrackUnmuted, handleTrackMuteChange)
      .on(RoomEvent.LocalTrackPublished, handleLocalPublicationChange)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalPublicationChange)
      .on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room
        .off(RoomEvent.TrackMuted, handleTrackMuteChange)
        .off(RoomEvent.TrackUnmuted, handleTrackMuteChange)
        .off(RoomEvent.LocalTrackPublished, handleLocalPublicationChange)
        .off(RoomEvent.LocalTrackUnpublished, handleLocalPublicationChange)
        .off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [effectiveLifecycleKind, getPublisherRoom, syncFromAuthoritativeLiveMicPath]);

  const liveMicControl = useMemo<StudioLiveMicControl | null>(() => {
    if (effectiveLifecycleKind !== "live" || !authoritativeLiveMicState.isAvailable) {
      return null;
    }

    return {
      isMuted: authoritativeLiveMicState.isMuted,
      isPending,
      onToggle: () => {
        void handleToggle();
      }
    };
  }, [
    authoritativeLiveMicState.isAvailable,
    authoritativeLiveMicState.isMuted,
    effectiveLifecycleKind,
    handleToggle,
    isPending
  ]);

  return {
    liveMicControl
  };
}
