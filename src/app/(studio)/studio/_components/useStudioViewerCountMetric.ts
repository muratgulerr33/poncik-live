"use client";

import { RoomEvent, type Room } from "livekit-client";
import { useEffect, useState } from "react";

function readViewerCount(room: Room | null) {
  return room ? room.remoteParticipants.size : null;
}

export function useStudioViewerCountMetric(room: Room | null) {
  const [metricState, setMetricState] = useState<{
    disconnectedRoom: Room | null;
    version: number;
  }>({
    disconnectedRoom: null,
    version: 0
  });

  useEffect(() => {
    if (!room) {
      return;
    }

    const syncViewerCount = () => {
      setMetricState((current) => ({
        disconnectedRoom: null,
        version: current.version + 1
      }));
    };

    const clearViewerCount = () => {
      setMetricState((current) => ({
        disconnectedRoom: room,
        version: current.version + 1
      }));
    };

    room.on(RoomEvent.ParticipantConnected, syncViewerCount);
    room.on(RoomEvent.ParticipantDisconnected, syncViewerCount);
    room.on(RoomEvent.Reconnected, syncViewerCount);
    room.on(RoomEvent.Disconnected, clearViewerCount);

    return () => {
      room.off(RoomEvent.ParticipantConnected, syncViewerCount);
      room.off(RoomEvent.ParticipantDisconnected, syncViewerCount);
      room.off(RoomEvent.Reconnected, syncViewerCount);
      room.off(RoomEvent.Disconnected, clearViewerCount);
    };
  }, [room]);

  return metricState.disconnectedRoom === room ? null : readViewerCount(room);
}
