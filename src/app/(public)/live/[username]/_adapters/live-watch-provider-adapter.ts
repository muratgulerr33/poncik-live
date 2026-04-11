"use client";

import {
  Room,
  RoomEvent,
  Track,
  TrackEvent,
  type RemoteTrack
} from "livekit-client";

type LiveWatchViewerTokenPayload = {
  participant_token: string;
  server_url: string;
};

type LiveWatchTrackHandlers = {
  onDisconnected: () => void;
  onSubscriptionFailed: () => void;
  onTrackSubscribed: (track: RemoteTrack) => void;
  onTrackUnsubscribed: (track: RemoteTrack) => void;
};

export type LiveWatchRoomConnectionResult =
  | {
      kind: "success";
      room: Room;
    }
  | {
      kind: "degraded";
    };

export type LiveWatchPlaybackBindResult = {
  cleanup: () => void;
  reconcileTracks: () => void;
};

export async function connectLiveWatchRoom(
  input: LiveWatchViewerTokenPayload
): Promise<LiveWatchRoomConnectionResult> {
  const room = new Room();

  try {
    await room.connect(input.server_url, input.participant_token);

    return {
      kind: "success",
      room
    };
  } catch {
    await room.disconnect().catch(() => undefined);

    return {
      kind: "degraded"
    };
  }
}

function readPublishedTracks(room: Room) {
  return Array.from(room.remoteParticipants.values()).flatMap((participant) =>
    Array.from(participant.trackPublications.values())
      .map((publication) => publication.track)
      .filter((track): track is RemoteTrack => Boolean(track))
  );
}

export function bindLiveWatchRoom(
  room: Room,
  handlers: LiveWatchTrackHandlers
): LiveWatchPlaybackBindResult {
  const handleTrackSubscribed = (track: RemoteTrack) => {
    handlers.onTrackSubscribed(track);
  };
  const handleTrackUnsubscribed = (track: RemoteTrack) => {
    handlers.onTrackUnsubscribed(track);
  };
  const handleDisconnected = () => {
    handlers.onDisconnected();
  };
  const handleSubscriptionFailed = () => {
    handlers.onSubscriptionFailed();
  };

  room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
  room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
  room.on(RoomEvent.Disconnected, handleDisconnected);
  room.on(RoomEvent.TrackSubscriptionFailed, handleSubscriptionFailed);

  return {
    cleanup: () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.TrackSubscriptionFailed, handleSubscriptionFailed);
    },
    reconcileTracks: () => {
      readPublishedTracks(room).forEach((track) => {
        handlers.onTrackSubscribed(track);
      });
    }
  };
}

export async function attachLiveWatchVideoTrack(
  track: RemoteTrack,
  videoElement: HTMLVideoElement
) {
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  track.attach(videoElement);

  try {
    await videoElement.play();
    return true;
  } catch {
    return false;
  }
}

export async function attachLiveWatchAudioTrack(
  track: RemoteTrack,
  audioElement: HTMLAudioElement
) {
  audioElement.autoplay = true;
  track.attach(audioElement);

  try {
    await audioElement.play();
    return true;
  } catch {
    return false;
  }
}

export function bindLiveWatchTrackPlaybackEvents(
  track: RemoteTrack,
  handlers: {
    onPlaybackFailed: () => void;
    onPlaybackStarted: () => void;
  }
) {
  const failedEvent =
    track.kind === Track.Kind.Audio
      ? TrackEvent.AudioPlaybackFailed
      : TrackEvent.VideoPlaybackFailed;
  const startedEvent =
    track.kind === Track.Kind.Audio
      ? TrackEvent.AudioPlaybackStarted
      : TrackEvent.VideoPlaybackStarted;

  track.on(failedEvent, handlers.onPlaybackFailed);
  track.on(startedEvent, handlers.onPlaybackStarted);

  return () => {
    track.off(failedEvent, handlers.onPlaybackFailed);
    track.off(startedEvent, handlers.onPlaybackStarted);
  };
}

export function detachLiveWatchTrack(
  track: RemoteTrack | null,
  element: HTMLMediaElement | null
) {
  if (!track) {
    return;
  }

  if (element) {
    track.detach(element);
    element.pause();
    element.srcObject = null;
    return;
  }

  track.detach();
}

export async function retryLiveWatchPlayback(
  videoElement: HTMLVideoElement | null,
  audioElement: HTMLAudioElement | null
) {
  try {
    if (videoElement) {
      await videoElement.play();
    }

    if (audioElement) {
      await audioElement.play();
    }

    return true;
  } catch {
    return false;
  }
}

export async function disconnectLiveWatchRoom(room: Room | null) {
  if (!room) {
    return;
  }

  try {
    await room.disconnect();
  } catch {
    await room.disconnect().catch(() => undefined);
  }
}
