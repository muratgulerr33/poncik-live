"use client";

import { Room, RoomEvent, Track, type LocalTrackPublication } from "livekit-client";

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

export type StudioPublisherLiveVideoSwitchAttemptResult =
  | {
      kind: "success";
    }
  | {
      kind: "no_active_live_video";
    }
  | {
      kind: "blocked" | "unsupported" | "degraded";
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

export function readStudioPublisherCameraPublication(
  room: Room | null
): LocalTrackPublication | null {
  const publication = room?.localParticipant.getTrackPublication(Track.Source.Camera);

  if (!publication?.track) {
    return null;
  }

  return publication;
}

function readStudioPublisherCameraOwner(room: Room | null) {
  return readStudioPublisherCameraPublication(room)?.videoTrack ?? null;
}

function readStudioPublisherFacingMode(
  facingMode: MediaTrackSettings["facingMode"]
): "user" | "environment" | null {
  return facingMode === "user" || facingMode === "environment" ? facingMode : null;
}

function resolveStudioPublisherRestartFacingMode(
  deviceId: string,
  currentVideoTrack: NonNullable<ReturnType<typeof readStudioPublisherCameraOwner>>
) {
  const sourceTrackSettings = currentVideoTrack.getSourceTrackSettings();

  if (sourceTrackSettings.deviceId !== deviceId) {
    return null;
  }

  return readStudioPublisherFacingMode(sourceTrackSettings.facingMode);
}

function mapStudioPublisherLiveVideoSwitchError(
  error: unknown
): Exclude<StudioPublisherLiveVideoSwitchAttemptResult, { kind: "success" | "no_active_live_video" }> {
  if (
    error instanceof DOMException &&
    ["NotAllowedError", "PermissionDeniedError"].includes(error.name)
  ) {
    return {
      kind: "blocked"
    };
  }

  if (
    error instanceof DOMException &&
    [
      "NotFoundError",
      "OverconstrainedError",
      "SecurityError",
      "NotSupportedError"
    ].includes(error.name)
  ) {
    return {
      kind: "unsupported"
    };
  }

  return {
    kind: "degraded"
  };
}

export async function switchStudioPublisherLiveVideo(
  room: Room | null,
  deviceId: string
): Promise<StudioPublisherLiveVideoSwitchAttemptResult> {
  const currentVideoTrack = readStudioPublisherCameraOwner(room);

  if (!currentVideoTrack) {
    return {
      kind: "no_active_live_video"
    };
  }

  const restartFacingMode = resolveStudioPublisherRestartFacingMode(
    deviceId,
    currentVideoTrack
  );

  try {
    if (restartFacingMode) {
      await currentVideoTrack.restartTrack({
        facingMode: restartFacingMode
      });
      return {
        kind: "success"
      };
    }

    const didSwitch = await currentVideoTrack.setDeviceId(deviceId);

    if (!didSwitch) {
      return {
        kind: "degraded"
      };
    }

    return {
      kind: "success"
    };
  } catch (error) {
    return mapStudioPublisherLiveVideoSwitchError(error);
  }
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
