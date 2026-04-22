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

type StudioPublisherCandidateCameraTrackAcquireResult =
  | {
      kind: "success";
      track: MediaStreamTrack;
    }
  | {
      kind: "blocked" | "unsupported" | "degraded";
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

export async function acquireStudioPublisherCandidateCameraTrack(
  deviceId: string
): Promise<StudioPublisherCandidateCameraTrackAcquireResult> {
  try {
    if (
      typeof window === "undefined" ||
      !("mediaDevices" in navigator) ||
      typeof navigator.mediaDevices?.getUserMedia !== "function"
    ) {
      return {
        kind: "unsupported"
      };
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
      return {
        kind: "degraded"
      };
    }

    return {
      kind: "success",
      track
    };
  } catch (error) {
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
      ["NotFoundError", "OverconstrainedError", "SecurityError"].includes(error.name)
    ) {
      return {
        kind: "unsupported"
      };
    }

    return {
      kind: "degraded"
    };
  }
}

export async function switchStudioPublisherLiveVideo(
  room: Room | null,
  deviceId: string
): Promise<StudioPublisherLiveVideoSwitchAttemptResult> {
  const publication = readStudioPublisherCameraPublication(room);
  const currentVideoTrack = publication?.videoTrack;

  if (!currentVideoTrack) {
    return {
      kind: "no_active_live_video"
    };
  }

  const candidateTrackResult = await acquireStudioPublisherCandidateCameraTrack(deviceId);

  if (candidateTrackResult.kind !== "success") {
    return candidateTrackResult;
  }

  const { track } = candidateTrackResult;

  try {
    await currentVideoTrack.replaceTrack(track, false);
    return {
      kind: "success"
    };
  } catch {
    track.stop();
    return {
      kind: "degraded"
    };
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
