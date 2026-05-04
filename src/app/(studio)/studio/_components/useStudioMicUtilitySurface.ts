"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RoomEvent,
  Track,
  type LocalParticipant,
  type LocalTrackPublication,
  type Participant,
  type Room,
  type TrackPublication
} from "livekit-client";

import {
  readStudioPreviewMicrophoneState,
  setStudioPreviewMicrophoneMuted,
  type StudioPreviewState
} from "../_adapters/studio-preview-adapter";
import { getStudioPublisherMicrophonePublication } from "../_adapters/studio-livekit-publisher-adapter";
import type { StudioMicControl } from "./StudioTopChrome";

type StudioMicUtilitySurfaceArgs = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  getPreviewStream: () => MediaStream | null;
  getPublisherRoom: () => Room | null;
  isStarting: boolean;
  isStopping: boolean;
  previewState: StudioPreviewState;
}>;

type MicRenderState = {
  isAvailable: boolean;
  isMuted: boolean;
};

type MicStartSnapshot = {
  initialMicMuted: boolean;
};

const DEFAULT_MIC_STATE: MicRenderState = {
  isAvailable: false,
  isMuted: false
};

export function useStudioMicUtilitySurface({
  effectiveLifecycleKind,
  getPreviewStream,
  getPublisherRoom,
  isStarting,
  isStopping,
  previewState
}: StudioMicUtilitySurfaceArgs) {
  const [previewMicState, setPreviewMicState] = useState<MicRenderState>(
    DEFAULT_MIC_STATE
  );
  const [liveMicState, setLiveMicState] = useState<MicRenderState>(DEFAULT_MIC_STATE);
  const [internalPending, setInternalPending] = useState(false);
  const lockedStartSnapshotRef = useRef<MicStartSnapshot | null>(null);
  const lastKnownLiveMutedRef = useRef<boolean | null>(null);

  const isPending = isStarting || isStopping || internalPending;

  const syncFromPreviewMicPath = useCallback(() => {
    if (previewState !== "preview_ready") {
      setPreviewMicState(DEFAULT_MIC_STATE);
      return DEFAULT_MIC_STATE;
    }

    const nextState = readStudioPreviewMicrophoneState(getPreviewStream());
    setPreviewMicState(nextState);
    return nextState;
  }, [getPreviewStream, previewState]);

  const syncFromLiveMicPath = useCallback(() => {
    const publication = getStudioPublisherMicrophonePublication(getPublisherRoom());

    if (!publication) {
      if (!isStopping) {
        setLiveMicState(DEFAULT_MIC_STATE);
        lastKnownLiveMutedRef.current = null;
      }

      return null;
    }

    const nextState = {
      isAvailable: true,
      isMuted: publication.isMuted
    };

    lastKnownLiveMutedRef.current = publication.isMuted;
    setLiveMicState(nextState);
    return publication;
  }, [getPublisherRoom, isStopping]);

  const captureMicStartSnapshot = useCallback(() => {
    if (previewState !== "preview_ready") {
      return null;
    }

    const snapshot = readStudioPreviewMicrophoneState(getPreviewStream());

    if (!snapshot.isAvailable) {
      return null;
    }

    const startSnapshot = {
      initialMicMuted: snapshot.isMuted
    };

    lockedStartSnapshotRef.current = startSnapshot;
    return startSnapshot;
  }, [getPreviewStream, previewState]);

  const handleToggle = useCallback(async () => {
    if (isPending) {
      return;
    }

    if (effectiveLifecycleKind === "live") {
      const publication = syncFromLiveMicPath();

      if (!publication) {
        return;
      }

      setInternalPending(true);

      try {
        if (publication.isMuted) {
          await publication.unmute();
        } else {
          await publication.mute();
        }
      } finally {
        syncFromLiveMicPath();
        setInternalPending(false);
      }

      return;
    }

    if (previewState !== "preview_ready") {
      return;
    }

    const previewStream = getPreviewStream();
    const snapshot = readStudioPreviewMicrophoneState(previewStream);

    if (!snapshot.isAvailable) {
      syncFromPreviewMicPath();
      return;
    }

    if (!setStudioPreviewMicrophoneMuted(previewStream, !snapshot.isMuted)) {
      syncFromPreviewMicPath();
      return;
    }

    syncFromPreviewMicPath();
  }, [
    effectiveLifecycleKind,
    getPreviewStream,
    isPending,
    previewState,
    syncFromLiveMicPath,
    syncFromPreviewMicPath
  ]);

  useEffect(() => {
    if (effectiveLifecycleKind === "live") {
      return;
    }

    syncFromPreviewMicPath();
  }, [effectiveLifecycleKind, syncFromPreviewMicPath]);

  useEffect(() => {
    if (effectiveLifecycleKind !== "live") {
      setInternalPending(false);

      if (!isStopping) {
        setLiveMicState(DEFAULT_MIC_STATE);
        lastKnownLiveMutedRef.current = null;
      }

      return;
    }

    const room = getPublisherRoom();

    if (!room) {
      if (!isStopping) {
        setLiveMicState(DEFAULT_MIC_STATE);
        lastKnownLiveMutedRef.current = null;
      }

      return;
    }

    function handleTrackMuteChange(
      publication: TrackPublication,
      participant: Participant
    ) {
      if (!participant.isLocal || publication.source !== Track.Source.Microphone) {
        return;
      }

      syncFromLiveMicPath();
    }

    function handleLocalPublicationChange(
      publication: LocalTrackPublication,
      participant: LocalParticipant
    ) {
      if (!participant.isLocal || publication.source !== Track.Source.Microphone) {
        return;
      }

      syncFromLiveMicPath();
    }

    function handleDisconnected() {
      setInternalPending(false);

      if (!isStopping) {
        setLiveMicState(DEFAULT_MIC_STATE);
        lastKnownLiveMutedRef.current = null;
      }
    }

    syncFromLiveMicPath();

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
  }, [effectiveLifecycleKind, getPublisherRoom, isStopping, syncFromLiveMicPath]);

  useEffect(() => {
    if (effectiveLifecycleKind === "live" || isStarting) {
      return;
    }

    lockedStartSnapshotRef.current = null;
  }, [effectiveLifecycleKind, isStarting]);

  useEffect(() => {
    return () => {
      lockedStartSnapshotRef.current = null;
    };
  }, []);

  const micControl = useMemo<StudioMicControl | null>(() => {
    if (isStarting && lockedStartSnapshotRef.current) {
      return {
        isMuted: lockedStartSnapshotRef.current.initialMicMuted,
        isPending,
        onToggle: () => {
          void handleToggle();
        }
      };
    }

    if (effectiveLifecycleKind === "live") {
      if (liveMicState.isAvailable) {
        return {
          isMuted: liveMicState.isMuted,
          isPending,
          onToggle: () => {
            void handleToggle();
          }
        };
      }

      if (isStopping && lastKnownLiveMutedRef.current !== null) {
        return {
          isMuted: lastKnownLiveMutedRef.current,
          isPending,
          onToggle: () => {
            void handleToggle();
          }
        };
      }

      return null;
    }

    if (!previewMicState.isAvailable) {
      return null;
    }

    return {
      isMuted: previewMicState.isMuted,
      isPending,
      onToggle: () => {
        void handleToggle();
      }
    };
  }, [
    effectiveLifecycleKind,
    handleToggle,
    isPending,
    isStarting,
    isStopping,
    liveMicState.isAvailable,
    liveMicState.isMuted,
    previewMicState.isAvailable,
    previewMicState.isMuted
  ]);

  return {
    captureMicStartSnapshot,
    micControl
  };
}
