"use client";

import {
  Room,
  RoomEvent,
  Track,
  createLocalVideoTrack,
  type LocalTrackPublication,
  type LocalVideoTrack,
  type TrackPublishOptions,
  type VideoCaptureOptions
} from "livekit-client";

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

export type StudioPublisherFacingMode = "user" | "environment";

export type StudioPublisherLiveVideoSwitchRequest = Readonly<{
  deviceId: string;
  preferredFacingMode?: StudioPublisherFacingMode | null;
}>;

type StudioPublisherCameraSnapshot = Readonly<{
  facingMode: StudioPublisherFacingMode | null;
  publication: LocalTrackPublication;
  publishOptions: TrackPublishOptions;
  track: LocalVideoTrack;
  deviceId: string | null;
}>;

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
): StudioPublisherFacingMode | null {
  return facingMode === "user" || facingMode === "environment" ? facingMode : null;
}

function readStudioPublisherCameraPublishOptions(publication: LocalTrackPublication) {
  return publication.options
    ? {
        ...publication.options,
        source: Track.Source.Camera
      }
    : {
        source: Track.Source.Camera
      };
}

function readStudioPublisherCameraSnapshot(
  room: Room | null
): StudioPublisherCameraSnapshot | null {
  const publication = readStudioPublisherCameraPublication(room);
  const track = publication?.videoTrack;

  if (!publication || !track) {
    return null;
  }

  const sourceTrackSettings = track.getSourceTrackSettings();
  const deviceId =
    typeof sourceTrackSettings.deviceId === "string" &&
    sourceTrackSettings.deviceId.length > 0
      ? sourceTrackSettings.deviceId
      : null;

  return {
    deviceId,
    facingMode: readStudioPublisherFacingMode(sourceTrackSettings.facingMode),
    publication,
    publishOptions: readStudioPublisherCameraPublishOptions(publication),
    track
  };
}

async function createStudioPublisherTargetVideoTrack(
  facingMode: StudioPublisherFacingMode
) {
  return createLocalVideoTrack({
    facingMode
  });
}

function resolveStudioPublisherRollbackVideoCaptureOptions(
  snapshot: StudioPublisherCameraSnapshot
): VideoCaptureOptions | null {
  if (snapshot.deviceId) {
    return {
      deviceId: snapshot.deviceId
    };
  }

  if (snapshot.facingMode) {
    return {
      facingMode: snapshot.facingMode
    };
  }

  return null;
}

async function rollbackStudioPublisherCameraSnapshot(
  room: Room | null,
  snapshot: StudioPublisherCameraSnapshot
) {
  const rollbackVideoCaptureOptions =
    resolveStudioPublisherRollbackVideoCaptureOptions(snapshot);

  if (!room || !rollbackVideoCaptureOptions) {
    return false;
  }

  let rollbackTrack: LocalVideoTrack | null = null;

  try {
    rollbackTrack = await createLocalVideoTrack(rollbackVideoCaptureOptions);
    await room.localParticipant.publishTrack(rollbackTrack, snapshot.publishOptions);
    return true;
  } catch {
    rollbackTrack?.stop();
    return false;
  }
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
  input: StudioPublisherLiveVideoSwitchRequest
): Promise<StudioPublisherLiveVideoSwitchAttemptResult> {
  const localParticipant = room?.localParticipant ?? null;
  const currentVideoTrack = readStudioPublisherCameraOwner(room);

  if (!currentVideoTrack || !localParticipant) {
    return {
      kind: "no_active_live_video"
    };
  }

  try {
    if (input.preferredFacingMode) {
      const snapshot = readStudioPublisherCameraSnapshot(room);

      if (!snapshot) {
        throw new Error("missing_current_camera_snapshot");
      }

      let didReleaseCurrentOwner = false;
      let freshTargetVideoTrack: LocalVideoTrack | null = null;

      try {
        const unpublishedPublication = await localParticipant.unpublishTrack(
          snapshot.track,
          false
        );

        if (!unpublishedPublication) {
          throw new Error("failed_to_unpublish_current_camera");
        }

        snapshot.track.stop();
        didReleaseCurrentOwner = true;
        freshTargetVideoTrack = await createStudioPublisherTargetVideoTrack(
          input.preferredFacingMode
        );
        await localParticipant.publishTrack(
          freshTargetVideoTrack,
          snapshot.publishOptions
        );
      } catch (error) {
        freshTargetVideoTrack?.stop();

        if (didReleaseCurrentOwner) {
          await rollbackStudioPublisherCameraSnapshot(room, snapshot);
        }

        throw error;
      }

      return {
        kind: "success"
      };
    }

    const didSwitch = await currentVideoTrack.setDeviceId(input.deviceId);

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
