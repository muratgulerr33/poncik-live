"use client";

import { Room, RoomEvent, Track } from "livekit-client";

type PublisherTokenResponse = {
  server_url: string;
  participant_token: string;
};

type StudioPublisherTokenFetchResult =
  | {
      kind: "success";
      payload: PublisherTokenResponse;
    }
  | {
      kind: "forbidden" | "unauthorized" | "degraded";
    };

type StudioPublisherConnectionResult =
  | {
      kind: "success";
      room: Room;
    }
  | {
      kind: "degraded";
    };

export async function fetchStudioPublisherToken(): Promise<StudioPublisherTokenFetchResult> {
  try {
    const response = await fetch("/api/livekit/publisher-token", {
      cache: "no-store",
      method: "POST"
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          kind: "unauthorized"
        };
      }

      if (response.status === 403) {
        return {
          kind: "forbidden"
        };
      }

      return {
        kind: "degraded"
      };
    }

    const body = (await response.json()) as Partial<PublisherTokenResponse>;

    if (
      typeof body.server_url !== "string" ||
      typeof body.participant_token !== "string"
    ) {
      return {
        kind: "degraded"
      };
    }

    return {
      kind: "success",
      payload: {
        participant_token: body.participant_token,
        server_url: body.server_url
      }
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

export async function connectStudioPublisherRoom(
  input: PublisherTokenResponse
): Promise<StudioPublisherConnectionResult> {
  const room = new Room();

  try {
    await room.connect(input.server_url, input.participant_token);

    return {
      kind: "success",
      room
    };
  } catch {
    await room.disconnect();

    return {
      kind: "degraded"
    };
  }
}

export async function publishStudioPreviewTracks(room: Room, stream: MediaStream) {
  const tracks = stream.getTracks();

  if (tracks.length === 0) {
    return false;
  }

  try {
    await Promise.all(
      tracks.map((track) =>
        room.localParticipant.publishTrack(track, {
          source:
            track.kind === "video" ? Track.Source.Camera : Track.Source.Microphone
        })
      )
    );

    return true;
  } catch {
    return false;
  }
}

export async function switchStudioPublisherCameraDevice(
  room: Room,
  deviceId: string
) {
  const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
  const videoTrack = publication?.videoTrack;

  if (!videoTrack) {
    return null;
  }

  const didSwitch = await videoTrack.setDeviceId(deviceId);

  if (!didSwitch) {
    return null;
  }

  const activeDeviceId =
    (await videoTrack.getDeviceId(false)) ??
    videoTrack.mediaStreamTrack.getSettings().deviceId;

  if (activeDeviceId !== deviceId) {
    return null;
  }

  return videoTrack.mediaStreamTrack;
}

export async function disconnectStudioPublisherRoom(room: Room | null) {
  if (!room) {
    return;
  }

  try {
    await room.disconnect(false);
  } catch {
    await room.disconnect(false).catch(() => undefined);
  }
}

export function bindStudioPublisherRoomDisconnect(
  room: Room,
  onDisconnected: () => void
) {
  function handleDisconnected() {
    onDisconnected();
  }

  room.on(RoomEvent.Disconnected, handleDisconnected);

  return {
    cleanup: () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    }
  };
}
