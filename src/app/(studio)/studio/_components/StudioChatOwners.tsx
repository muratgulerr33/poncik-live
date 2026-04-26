"use client";

import type { Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  bindStudioChatRealtime,
  publishStudioChatMessage,
  type StudioRealtimeChatMessage
} from "../_lib/studio-chat-realtime-transport";
import { StudioChatOwnersSurface } from "./StudioChatOwnersSurface";

type StudioChatOwnersProps = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStarting: boolean;
  isStopping: boolean;
  room: Room | null;
  username: string;
}>;

type ChatOwnerPhase = "hidden" | "live" | "exiting";
export type StudioChatMessageRow = Readonly<{
  id: string;
  username: string;
  text: string;
}>;

const CHAT_OWNER_EXIT_DURATION_MS = 220;
const CHAT_HISTORY_CAP = 100;
const DUPLICATE_KEY_CAP = 200;
const SEND_COOLDOWN_MS = 900;
const REMOTE_LATEST_NEAR_BOTTOM_GAP_PX = 32;
const REMOTE_LATEST_SCROLL_SETTLE_GAP_PX = 1;

function clearScheduledTimeout(timeoutRef: {
  current: ReturnType<typeof setTimeout> | null;
}) {
  if (!timeoutRef.current) {
    return;
  }

  clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}

function clearScheduledAnimationFrame(frameRef: { current: number | null }) {
  if (frameRef.current === null) {
    return;
  }

  cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
}

function getBottomGap(element: HTMLDivElement | null) {
  if (!element) {
    return Number.POSITIVE_INFINITY;
  }

  return element.scrollHeight - element.clientHeight - element.scrollTop;
}

export function StudioChatOwners({
  effectiveLifecycleKind,
  isStarting,
  isStopping,
  room,
  username
}: StudioChatOwnersProps) {
  const [phase, setPhase] = useState<ChatOwnerPhase>("hidden");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<StudioChatMessageRow[]>([]);
  const [remoteLatestCorrectionSequence, setRemoteLatestCorrectionSequence] =
    useState(0);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const latestScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteLatestCorrectionFrameRef = useRef<number | null>(null);
  const hasPendingExitRef = useRef(false);
  const hasBeenLiveRef = useRef(false);
  const hasInitializedLiveStateRef = useRef(false);
  const pendingRemoteLatestCorrectionRef = useRef(false);
  const duplicateKeyQueueRef = useRef<string[]>([]);
  const duplicateKeySetRef = useRef(new Set<string>());
  const lastSentAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayScrollRef = useRef<HTMLDivElement | null>(null);
  const isLive = effectiveLifecycleKind === "live";
  const isActive = phase === "live";
  const hasRenderableUsername = username.trim().length > 0;

  const appendMessageRow = useCallback((message: StudioChatMessageRow) => {
    setMessages((currentMessages) =>
      [...currentMessages, message].slice(-CHAT_HISTORY_CAP)
    );
  }, []);

  const clearPendingRemoteLatestCorrection = useCallback(() => {
    pendingRemoteLatestCorrectionRef.current = false;
    clearScheduledAnimationFrame(remoteLatestCorrectionFrameRef);
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

  const schedulePhaseUpdate = (nextPhase: ChatOwnerPhase) => {
    clearScheduledTimeout(phaseSyncTimeoutRef);
    phaseSyncTimeoutRef.current = setTimeout(() => {
      phaseSyncTimeoutRef.current = null;
      setPhase((currentPhase) =>
        currentPhase === nextPhase ? currentPhase : nextPhase
      );
    }, 0);
  };

  const scheduleScrollToLatest = useCallback(() => {
    clearScheduledTimeout(latestScrollTimeoutRef);
    latestScrollTimeoutRef.current = setTimeout(() => {
      const overlayElement = overlayScrollRef.current;

      latestScrollTimeoutRef.current = null;

      if (!overlayElement) {
        return;
      }

      overlayElement.scrollTo({
        top: overlayElement.scrollHeight,
        behavior: "smooth"
      });
    }, 0);
  }, []);

  const scheduleInteractionReset = useCallback(() => {
    clearPendingRemoteLatestCorrection();
    clearScheduledTimeout(interactionResetTimeoutRef);
    interactionResetTimeoutRef.current = setTimeout(() => {
      interactionResetTimeoutRef.current = null;
      duplicateKeyQueueRef.current = [];
      duplicateKeySetRef.current.clear();
      lastSentAtRef.current = 0;
      setInputValue("");
      setMessages([]);
    }, 0);
  }, [clearPendingRemoteLatestCorrection]);

  const handleInputValueChange = useCallback((nextValue: string) => {
    setInputValue(nextValue);
  }, []);

  const handleReceiveMessage = useCallback(
    (message: StudioRealtimeChatMessage) => {
      const duplicateKey = `${message.participantIdentity}:${message.id}`;

      if (!rememberDuplicateKey(duplicateKey)) {
        return;
      }

      if (
        getBottomGap(overlayScrollRef.current) <=
        REMOTE_LATEST_NEAR_BOTTOM_GAP_PX
      ) {
        pendingRemoteLatestCorrectionRef.current = true;
        setRemoteLatestCorrectionSequence((currentSequence) => currentSequence + 1);
      }

      appendMessageRow({
        id: message.id,
        text: message.text,
        username: message.username
      });
    },
    [appendMessageRow, rememberDuplicateKey]
  );

  const handleSubmitMessage = useCallback(() => {
    if (!isActive || !room) {
      return;
    }

    const now = Date.now();

    if (now - lastSentAtRef.current < SEND_COOLDOWN_MS) {
      return;
    }

    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    lastSentAtRef.current = now;

    void publishStudioChatMessage(room, trimmedValue, username).then((result) => {
      if (result.kind !== "published") {
        return;
      }

      const duplicateKey = `${result.message.participantIdentity}:${result.message.id}`;
      if (!rememberDuplicateKey(duplicateKey)) {
        return;
      }
      appendMessageRow({
        id: result.message.id,
        text: result.message.text,
        username: result.message.username
      });
      setInputValue("");
      inputRef.current?.blur();
      scheduleScrollToLatest();
    });
  }, [
    appendMessageRow,
    inputValue,
    isActive,
    rememberDuplicateKey,
    room,
    scheduleScrollToLatest,
    username
  ]);

  useEffect(() => {
    return () => {
      clearPendingRemoteLatestCorrection();
      clearScheduledTimeout(exitTimeoutRef);
      clearScheduledTimeout(interactionResetTimeoutRef);
      clearScheduledTimeout(latestScrollTimeoutRef);
      clearScheduledTimeout(phaseSyncTimeoutRef);
    };
  }, [clearPendingRemoteLatestCorrection]);

  useEffect(() => {
    if (!pendingRemoteLatestCorrectionRef.current) {
      return;
    }

    clearScheduledAnimationFrame(remoteLatestCorrectionFrameRef);
    remoteLatestCorrectionFrameRef.current = requestAnimationFrame(() => {
      remoteLatestCorrectionFrameRef.current = null;

      const overlayElement = overlayScrollRef.current;

      if (!overlayElement) {
        pendingRemoteLatestCorrectionRef.current = false;
        return;
      }

      overlayElement.scrollTop = overlayElement.scrollHeight;

      if (getBottomGap(overlayElement) > REMOTE_LATEST_SCROLL_SETTLE_GAP_PX) {
        overlayElement.scrollTop = overlayElement.scrollHeight;
      }

      pendingRemoteLatestCorrectionRef.current = false;
    });

    return () => {
      clearScheduledAnimationFrame(remoteLatestCorrectionFrameRef);
    };
  }, [remoteLatestCorrectionSequence]);

  useEffect(() => {
    if (!room) {
      return;
    }

    return bindStudioChatRealtime(room, handleReceiveMessage);
  }, [handleReceiveMessage, room]);

  useEffect(() => {
    if (!hasRenderableUsername) {
      return;
    }

    if (isLive && !isStopping) {
      clearScheduledTimeout(exitTimeoutRef);
      clearScheduledTimeout(phaseSyncTimeoutRef);
      hasPendingExitRef.current = false;
      hasBeenLiveRef.current = true;
      schedulePhaseUpdate("live");

      if (!hasInitializedLiveStateRef.current) {
        hasInitializedLiveStateRef.current = true;
        scheduleInteractionReset();
      }

      return;
    }

    if (isStarting) {
      clearScheduledTimeout(exitTimeoutRef);
      clearScheduledTimeout(phaseSyncTimeoutRef);
      hasPendingExitRef.current = false;
      hasBeenLiveRef.current = false;
      hasInitializedLiveStateRef.current = false;
      scheduleInteractionReset();
      schedulePhaseUpdate("hidden");
      return;
    }

    if (isStopping || hasBeenLiveRef.current) {
      if (hasPendingExitRef.current) {
        return;
      }

      clearScheduledTimeout(exitTimeoutRef);
      hasPendingExitRef.current = true;
      hasBeenLiveRef.current = false;
      hasInitializedLiveStateRef.current = false;
      schedulePhaseUpdate("exiting");
      exitTimeoutRef.current = setTimeout(() => {
        hasPendingExitRef.current = false;
        exitTimeoutRef.current = null;
        clearPendingRemoteLatestCorrection();
        duplicateKeyQueueRef.current = [];
        duplicateKeySetRef.current.clear();
        lastSentAtRef.current = 0;
        setPhase("hidden");
        setInputValue("");
        setMessages([]);
      }, CHAT_OWNER_EXIT_DURATION_MS);
      return;
    }

    clearScheduledTimeout(exitTimeoutRef);
    clearScheduledTimeout(phaseSyncTimeoutRef);
    hasPendingExitRef.current = false;
    hasInitializedLiveStateRef.current = false;
    scheduleInteractionReset();
    schedulePhaseUpdate("hidden");
  }, [
    hasRenderableUsername,
    isLive,
    isStarting,
    isStopping,
    clearPendingRemoteLatestCorrection,
    scheduleInteractionReset
  ]);

  if (phase === "hidden" || !hasRenderableUsername) {
    return null;
  }

  return (
    <StudioChatOwnersSurface
      inputRef={inputRef}
      inputValue={inputValue}
      isActive={isActive}
      messages={messages}
      overlayScrollRef={overlayScrollRef}
      phase={phase}
      username={username}
      onInputValueChange={handleInputValueChange}
      onSubmitMessage={handleSubmitMessage}
    />
  );
}
