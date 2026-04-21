"use client";

import { Room, RoomEvent, Track } from "livekit-client";

const CAMERA_SWITCH_SETTLE_TIMEOUT_MS = 1200;
const CAMERA_SWITCH_SETTLE_POLL_INTERVAL_MS = 50;

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

type StudioPublisherTrackSnapshot = Readonly<{
  activeDeviceId: string | null;
  facingMode: string | null;
  groupId: string | null;
  label: string | null;
  mediaStreamTrack: MediaStreamTrack;
}>;

function normalizeFacingMode(value: MediaTrackSettings["facingMode"]) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function readPublisherTrackSnapshot(videoTrack: {
  getDeviceId: (fallback?: boolean) => Promise<string | undefined>;
  mediaStreamTrack: MediaStreamTrack;
}): Promise<StudioPublisherTrackSnapshot> {
  const mediaStreamTrack = videoTrack.mediaStreamTrack;
  const settings = mediaStreamTrack.getSettings();

  return {
    activeDeviceId: (await videoTrack.getDeviceId(false)) ?? settings.deviceId ?? null,
    facingMode: normalizeFacingMode(settings.facingMode),
    groupId: settings.groupId ?? null,
    label: mediaStreamTrack.label || null,
    mediaStreamTrack
  };
}

function hasTrackIdentityShifted(
  previousSnapshot: StudioPublisherTrackSnapshot,
  nextSnapshot: StudioPublisherTrackSnapshot
) {
  return (
    previousSnapshot.mediaStreamTrack !== nextSnapshot.mediaStreamTrack ||
    previousSnapshot.mediaStreamTrack.id !== nextSnapshot.mediaStreamTrack.id ||
    previousSnapshot.groupId !== nextSnapshot.groupId ||
    previousSnapshot.facingMode !== nextSnapshot.facingMode ||
    previousSnapshot.label !== nextSnapshot.label
  );
}

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

  const previousSnapshot = await readPublisherTrackSnapshot(videoTrack);

  let didSwitch = false;

  try {
    didSwitch = await videoTrack.setDeviceId(deviceId);
  } catch {
    return null;
  }

  if (!didSwitch) {
    return null;
  }

  const deadline = Date.now() + CAMERA_SWITCH_SETTLE_TIMEOUT_MS;

  while (true) {
    const nextSnapshot = await readPublisherTrackSnapshot(videoTrack);
    const didReadbackMatch = nextSnapshot.activeDeviceId === deviceId;
    const didTrackIdentityShift = hasTrackIdentityShifted(previousSnapshot, nextSnapshot);
    const isReturnedTrackReady = nextSnapshot.mediaStreamTrack.readyState === "live";

    if (isReturnedTrackReady && (didReadbackMatch || didTrackIdentityShift)) {
      return nextSnapshot.mediaStreamTrack;
    }

    if (Date.now() >= deadline) {
      return null;
    }

    await sleep(CAMERA_SWITCH_SETTLE_POLL_INTERVAL_MS);
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
