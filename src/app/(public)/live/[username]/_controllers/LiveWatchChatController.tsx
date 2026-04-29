"use client";

import type { Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import { LiveWatchGuestAuthSurface } from "../_components/LiveWatchGuestAuthSurface";
import { useLiveWatchSurfaceNotice } from "../_components/LiveWatchSurfaceNoticeProvider";
import {
  LiveWatchChatSurface,
  type LiveWatchChatMessage
} from "../_components/LiveWatchChatSurface";
import {
  bindLiveWatchChatRealtime,
  publishLiveWatchChatMessage,
  type LiveWatchRealtimeChatMessage
} from "../_lib/live-watch-chat-realtime-transport";

export type LiveWatchChatAccess =
  | {
      kind: "guest";
    }
  | {
      kind: "viewer_ready";
      viewerUsername: string;
    }
  | {
      kind: "viewer_role_blocked";
    }
  | {
      kind: "viewer_username_blocked";
    }
  | {
      kind: "auth_state_blocked";
    };

type LiveWatchChatControllerProps = Readonly<{
  access: LiveWatchChatAccess;
  isInteractive: boolean;
  room: Room | null;
}>;

const MAX_MESSAGE_LENGTH = 220;
const CHAT_HISTORY_CAP = 100;
const DUPLICATE_KEY_CAP = 200;
const SEND_COOLDOWN_MS = 900;
const LIVE_WATCH_AUTH_SUCCESS_NOTICE_DELAY_MS = 650;
const LIVE_WATCH_AUTH_SUCCESS_NOTICE_DURATION_MS = 2500;

export function LiveWatchChatController({
  access,
  isInteractive,
  room
}: LiveWatchChatControllerProps) {
  const { showNotice } = useLiveWatchSurfaceNotice();
  const [draft, setDraft] = useState("");
  const [isGuestAuthSurfaceOpen, setGuestAuthSurfaceOpen] = useState(false);
  const [messages, setMessages] = useState<readonly LiveWatchChatMessage[]>([]);
  const overlayScrollRef = useRef<HTMLDivElement | null>(null);
  const duplicateKeyQueueRef = useRef<string[]>([]);
  const duplicateKeySetRef = useRef(new Set<string>());
  const lastSentAtRef = useRef(0);

  const appendMessage = useCallback((message: LiveWatchChatMessage) => {
    setMessages((currentMessages) =>
      [...currentMessages, message].slice(-CHAT_HISTORY_CAP)
    );
  }, []);

  const rememberDuplicateKey = useCallback((duplicateKey: string) => {
    if (duplicateKeySetRef.current.has(duplicateKey)) {
      return false;
    }

    duplicateKeySetRef.current.add(duplicateKey);
    duplicateKeyQueueRef.current.push(duplicateKey);

    while (duplicateKeyQueueRef.current.length > DUPLICATE_KEY_CAP) {
      const oldestKey = duplicateKeyQueueRef.current.shift();

      if (oldestKey) {
        duplicateKeySetRef.current.delete(oldestKey);
      }
    }

    return true;
  }, []);

  useEffect(() => {
    if (!overlayScrollRef.current) {
      return;
    }

    overlayScrollRef.current.scrollTop = overlayScrollRef.current.scrollHeight;
  }, [messages]);

  function handleDraftChange(nextValue: string) {
    setDraft(nextValue.slice(0, MAX_MESSAGE_LENGTH));
  }

  const handleReceiveMessage = useCallback(
    (message: LiveWatchRealtimeChatMessage) => {
      const duplicateKey = `${message.participantIdentity}:${message.id}`;

      if (!rememberDuplicateKey(duplicateKey)) {
        return;
      }

      appendMessage({
        content: message.text,
        id: message.id,
        username: message.username
      });
    },
    [appendMessage, rememberDuplicateKey]
  );

  useEffect(() => {
    if (!room) {
      return;
    }

    return bindLiveWatchChatRealtime(room, handleReceiveMessage);
  }, [handleReceiveMessage, room]);

  const handleGuestAuthRequest = useCallback(() => {
    if (access.kind !== "guest") {
      return;
    }

    setGuestAuthSurfaceOpen(true);
  }, [access.kind]);

  const handleGuestAuthSuccess = useCallback(() => {
    showNotice({
      message: "Poncik’e hoş geldiniz",
      tone: "success",
      delayMs: LIVE_WATCH_AUTH_SUCCESS_NOTICE_DELAY_MS,
      durationMs: LIVE_WATCH_AUTH_SUCCESS_NOTICE_DURATION_MS
    });
  }, [showNotice]);

  function handleSubmit() {
    if (!isInteractive || access.kind !== "viewer_ready" || !room) {
      return;
    }

    const now = Date.now();

    if (now - lastSentAtRef.current < SEND_COOLDOWN_MS) {
      return;
    }

    const content = draft.trim();

    if (!content) {
      return;
    }

    lastSentAtRef.current = now;

    void publishLiveWatchChatMessage(room, content, access.viewerUsername).then(
      (result) => {
        if (result.kind !== "published") {
          return;
        }

        const duplicateKey = `${result.message.participantIdentity}:${result.message.id}`;
        if (!rememberDuplicateKey(duplicateKey)) {
          return;
        }
        appendMessage({
          content: result.message.text,
          id: result.message.id,
          username: result.message.username
        });
        setDraft("");
      }
    );
  }

  return (
    <>
      <LiveWatchChatSurface
        access={access}
        draft={draft}
        isAuthSurfaceOpen={isGuestAuthSurfaceOpen}
        isInteractive={isInteractive}
        messages={messages}
        onDraftChange={handleDraftChange}
        onGuestAuthRequest={handleGuestAuthRequest}
        onSubmit={handleSubmit}
        overlayScrollRef={overlayScrollRef}
      />

      <LiveWatchGuestAuthSurface
        isOpen={isGuestAuthSurfaceOpen}
        onAuthSuccess={handleGuestAuthSuccess}
        onClose={() => {
          setGuestAuthSurfaceOpen(false);
        }}
      />
    </>
  );
}
