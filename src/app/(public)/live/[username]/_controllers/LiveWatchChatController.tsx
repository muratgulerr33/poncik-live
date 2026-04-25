"use client";

import { useEffect, useRef, useState } from "react";

import {
  LiveWatchChatSurface,
  type LiveWatchChatMessage
} from "../_components/LiveWatchChatSurface";

export type LiveWatchChatAccess =
  | {
      kind: "guest";
    }
  | {
      kind: "viewer_ready";
      viewerUsername: string;
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
}>;

const MAX_MESSAGE_LENGTH = 220;

function createLocalMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function LiveWatchChatController({
  access,
  isInteractive
}: LiveWatchChatControllerProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<readonly LiveWatchChatMessage[]>([]);
  const overlayScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!overlayScrollRef.current) {
      return;
    }

    overlayScrollRef.current.scrollTop = overlayScrollRef.current.scrollHeight;
  }, [messages]);

  function handleDraftChange(nextValue: string) {
    setDraft(nextValue.slice(0, MAX_MESSAGE_LENGTH));
  }

  function handleSubmit() {
    if (!isInteractive || access.kind !== "viewer_ready") {
      return;
    }

    const content = draft.trim();

    if (!content) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: createLocalMessageId(),
        username: access.viewerUsername,
        content
      }
    ]);
    setDraft("");
  }

  return (
    <LiveWatchChatSurface
      access={access}
      draft={draft}
      isInteractive={isInteractive}
      messages={messages}
      onDraftChange={handleDraftChange}
      onSubmit={handleSubmit}
      overlayScrollRef={overlayScrollRef}
    />
  );
}
