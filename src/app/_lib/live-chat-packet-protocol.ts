const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const LIVE_CHAT_TOPIC = "poncik.chat.message.v1";
export const LIVE_CHAT_PACKET_VERSION = 1 as const;
export const LIVE_CHAT_PACKET_TYPE = "chat.message" as const;
export const MAX_TEXT_LENGTH = 220;
export const MAX_ID_LENGTH = 80;

const MAX_PACKET_BYTES = 1024;

export type LiveChatMessagePacket = Readonly<{
  v: typeof LIVE_CHAT_PACKET_VERSION;
  type: typeof LIVE_CHAT_PACKET_TYPE;
  id: string;
  text: string;
}>;

export type LiveChatPacketDropReason =
  | "malformed_json"
  | "oversized_payload"
  | "unknown_packet_shape"
  | "invalid_id"
  | "invalid_text";

export type LiveChatPacketValidationResult =
  | {
      kind: "ok";
      packet: LiveChatMessagePacket;
    }
  | {
      kind: "drop";
      reason: LiveChatPacketDropReason;
    };

export type LiveChatPacketEncodeResult =
  | {
      kind: "ok";
      bytes: Uint8Array;
      packet: LiveChatMessagePacket;
    }
  | {
      kind: "drop";
      reason: LiveChatPacketDropReason;
    };

function normalizePacketId(id: string) {
  return id.trim();
}

function isValidPacketId(id: string) {
  return id.length > 0 && id.length <= MAX_ID_LENGTH;
}

function normalizePacketText(text: string) {
  return text.trim();
}

function isValidPacketText(text: string) {
  return text.length > 0 && text.length <= MAX_TEXT_LENGTH;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function createLiveChatPacketId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().slice(0, MAX_ID_LENGTH);
  }

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return toHex(bytes).slice(0, MAX_ID_LENGTH);
  }

  return `packet-${Date.now().toString(36)}`.slice(0, MAX_ID_LENGTH);
}

function validatePacketShape(value: unknown): LiveChatPacketValidationResult {
  if (typeof value !== "object" || value === null) {
    return {
      kind: "drop",
      reason: "unknown_packet_shape"
    };
  }

  const packet = value as Partial<LiveChatMessagePacket>;
  const normalizedId =
    typeof packet.id === "string" ? normalizePacketId(packet.id) : "";
  const normalizedText =
    typeof packet.text === "string" ? normalizePacketText(packet.text) : "";

  if (
    packet.v !== LIVE_CHAT_PACKET_VERSION ||
    packet.type !== LIVE_CHAT_PACKET_TYPE
  ) {
    return {
      kind: "drop",
      reason: "unknown_packet_shape"
    };
  }

  if (!isValidPacketId(normalizedId)) {
    return {
      kind: "drop",
      reason: "invalid_id"
    };
  }

  if (!isValidPacketText(normalizedText)) {
    return {
      kind: "drop",
      reason: "invalid_text"
    };
  }

  return {
    kind: "ok",
    packet: {
      v: LIVE_CHAT_PACKET_VERSION,
      type: LIVE_CHAT_PACKET_TYPE,
      id: normalizedId,
      text: normalizedText
    }
  };
}

export function encodeLiveChatMessagePacket(input: {
  id?: string;
  text: string;
}): LiveChatPacketEncodeResult {
  const validation = validatePacketShape({
    id: input.id ?? createLiveChatPacketId(),
    text: input.text,
    type: LIVE_CHAT_PACKET_TYPE,
    v: LIVE_CHAT_PACKET_VERSION
  });

  if (validation.kind !== "ok") {
    return validation;
  }

  const bytes = encoder.encode(JSON.stringify(validation.packet));

  if (bytes.byteLength > MAX_PACKET_BYTES) {
    return {
      kind: "drop",
      reason: "oversized_payload"
    };
  }

  return {
    kind: "ok",
    bytes,
    packet: validation.packet
  };
}

export function decodeLiveChatMessagePacket(
  bytes: Uint8Array
): LiveChatPacketValidationResult {
  if (bytes.byteLength > MAX_PACKET_BYTES) {
    return {
      kind: "drop",
      reason: "oversized_payload"
    };
  }

  try {
    const parsed = JSON.parse(decoder.decode(bytes)) as unknown;
    return validatePacketShape(parsed);
  } catch {
    return {
      kind: "drop",
      reason: "malformed_json"
    };
  }
}
