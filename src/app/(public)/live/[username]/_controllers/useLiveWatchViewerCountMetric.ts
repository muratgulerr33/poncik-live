"use client";

import { RoomEvent, type Room } from "livekit-client";
import { useMemo, useSyncExternalStore } from "react";

type ViewerCountStore = Readonly<{
  getServerSnapshot: () => number | null;
  getSnapshot: () => number | null;
  subscribe: (onStoreChange: () => void) => () => void;
}>;

const EMPTY_VIEWER_COUNT_STORE: ViewerCountStore = {
  getServerSnapshot: () => null,
  getSnapshot: () => null,
  subscribe: () => {
    return () => {};
  }
};

function readViewerCount(room: Room) {
  return Math.max(1, room.remoteParticipants.size, room.numParticipants - 1);
}

function createViewerCountStore(room: Room): ViewerCountStore {
  const listeners = new Set<() => void>();
  let disconnected = false;
  let reconnecting = false;
  let signalReconnecting = false;
  let lastKnownCount = readViewerCount(room);

  const emitChange = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const getSnapshot = () => {
    if (disconnected) {
      return null;
    }

    if (reconnecting || signalReconnecting) {
      return lastKnownCount;
    }

    lastKnownCount = readViewerCount(room);
    return lastKnownCount;
  };

  const handleParticipantConnected = () => {
    if (disconnected) {
      return;
    }

    lastKnownCount = readViewerCount(room);
    emitChange();
  };

  const handleParticipantDisconnected = () => {
    if (disconnected) {
      return;
    }

    lastKnownCount = readViewerCount(room);
    emitChange();
  };

  const handleSignalReconnecting = () => {
    if (disconnected || signalReconnecting) {
      return;
    }

    signalReconnecting = true;
    emitChange();
  };

  const handleSignalConnected = () => {
    if (!signalReconnecting) {
      return;
    }

    signalReconnecting = false;
    lastKnownCount = readViewerCount(room);
    emitChange();
  };

  const handleReconnecting = () => {
    if (disconnected || reconnecting) {
      return;
    }

    reconnecting = true;
    emitChange();
  };

  const handleReconnected = () => {
    disconnected = false;
    reconnecting = false;
    signalReconnecting = false;
    lastKnownCount = readViewerCount(room);
    emitChange();
  };

  const handleDisconnected = () => {
    if (disconnected) {
      return;
    }

    disconnected = true;
    reconnecting = false;
    signalReconnecting = false;
    emitChange();
  };

  const attachListeners = () => {
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.SignalReconnecting, handleSignalReconnecting);
    room.on(RoomEvent.SignalConnected, handleSignalConnected);
    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
  };

  const detachListeners = () => {
    room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.off(RoomEvent.SignalReconnecting, handleSignalReconnecting);
    room.off(RoomEvent.SignalConnected, handleSignalConnected);
    room.off(RoomEvent.Reconnecting, handleReconnecting);
    room.off(RoomEvent.Reconnected, handleReconnected);
    room.off(RoomEvent.Disconnected, handleDisconnected);
  };

  return {
    getServerSnapshot: () => null,
    getSnapshot,
    subscribe: (onStoreChange) => {
      listeners.add(onStoreChange);

      if (listeners.size === 1) {
        attachListeners();
      }

      return () => {
        listeners.delete(onStoreChange);

        if (listeners.size === 0) {
          detachListeners();
        }
      };
    }
  };
}

export function useLiveWatchViewerCountMetric(room: Room | null) {
  const store = useMemo<ViewerCountStore>(() => {
    if (!room) {
      return EMPTY_VIEWER_COUNT_STORE;
    }

    return createViewerCountStore(room);
  }, [room]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}
