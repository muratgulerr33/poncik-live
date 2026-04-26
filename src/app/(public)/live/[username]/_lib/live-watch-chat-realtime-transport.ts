"use client";

import {
  DataPacket_Kind,
  RoomEvent,
  type Room,
  type RemoteParticipant
} from "livekit-client";

import {
  LIVE_CHAT_TOPIC,
  decodeLiveChatMessagePacket,
  encodeLiveChatMessagePacket
} from "@/app/_lib/live-chat-packet-protocol";

export type LiveWatchRealtimeChatMessage = Readonly<{
  id: string;
  participantIdentity: string;
  text: string;
  username: string;
}>;

export type LiveWatchChatPublishResult =
  | {
      kind: "published";
      message: LiveWatchRealtimeChatMessage;
    }
  | {
      kind: "drop";
    }
  | {
      kind: "not_ready" | "publish_failed";
    };

function toMessage(
  participant: RemoteParticipant,
  packet: { id: string; text: string }
): LiveWatchRealtimeChatMessage | null {
  const username = participant.name?.trim() ?? "";

  if (!username) {
    return null;
  }

  return {
    id: packet.id,
    participantIdentity: participant.identity,
    text: packet.text,
    username
  };
}

export async function publishLiveWatchChatMessage(
  room: Room | null,
  text: string,
  username: string
): Promise<LiveWatchChatPublishResult> {
  if (!room) {
    return {
      kind: "not_ready"
    };
  }

  const localUsername = username.trim();

  if (!localUsername || !room.localParticipant.identity) {
    return {
      kind: "not_ready"
    };
  }

  const encoded = encodeLiveChatMessagePacket({
    text
  });

  if (encoded.kind !== "ok") {
    return {
      kind: "drop"
    };
  }

  try {
    await room.localParticipant.publishData(encoded.bytes, {
      reliable: true,
      topic: LIVE_CHAT_TOPIC
    });

    return {
      kind: "published",
      message: {
        id: encoded.packet.id,
        participantIdentity: room.localParticipant.identity,
        text: encoded.packet.text,
        username: localUsername
      }
    };
  } catch {
    return {
      kind: "publish_failed"
    };
  }
}

export function bindLiveWatchChatRealtime(
  room: Room,
  onMessage: (message: LiveWatchRealtimeChatMessage) => void
) {
  const handleDataReceived = (
    payload: Uint8Array,
    participant?: RemoteParticipant,
    kind?: DataPacket_Kind,
    topic?: string
  ) => {
    if (kind !== DataPacket_Kind.RELIABLE || topic !== LIVE_CHAT_TOPIC) {
      return;
    }

    if (!participant) {
      return;
    }

    const decoded = decodeLiveChatMessagePacket(payload);

    if (decoded.kind !== "ok") {
      return;
    }

    const message = toMessage(participant, decoded.packet);

    if (!message) {
      return;
    }

    onMessage(message);
  };

  room.on(RoomEvent.DataReceived, handleDataReceived);

  return () => {
    room.off(RoomEvent.DataReceived, handleDataReceived);
  };
}
