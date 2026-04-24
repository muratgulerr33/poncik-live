"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { StudioChatOwnersSurface } from "./StudioChatOwnersSurface";

type StudioChatOwnersProps = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStarting: boolean;
  isStopping: boolean;
  username: string;
}>;

type ChatOwnerPhase = "hidden" | "live" | "exiting";
export type StudioChatMessageRow = Readonly<{
  id: number;
  username: string;
  text: string;
}>;

const CHAT_OWNER_EXIT_DURATION_MS = 220;

function clearScheduledTimeout(timeoutRef: {
  current: ReturnType<typeof setTimeout> | null;
}) {
  if (!timeoutRef.current) {
    return;
  }

  clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}

export function StudioChatOwners({
  effectiveLifecycleKind,
  isStarting,
  isStopping,
  username
}: StudioChatOwnersProps) {
  const [phase, setPhase] = useState<ChatOwnerPhase>("hidden");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<StudioChatMessageRow[]>([]);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const latestScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingExitRef = useRef(false);
  const hasBeenLiveRef = useRef(false);
  const hasInitializedLiveStateRef = useRef(false);
  const nextMessageIdRef = useRef(1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayScrollRef = useRef<HTMLDivElement | null>(null);
  const isLive = effectiveLifecycleKind === "live";
  const isActive = phase === "live";
  const hasRenderableUsername = username.trim().length > 0;

  const createMessageRow = useCallback(
    (text: string): StudioChatMessageRow => {
      const nextId = nextMessageIdRef.current;
      nextMessageIdRef.current += 1;

      return {
        id: nextId,
        username,
        text
      };
    },
    [username]
  );

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
    clearScheduledTimeout(interactionResetTimeoutRef);
    interactionResetTimeoutRef.current = setTimeout(() => {
      interactionResetTimeoutRef.current = null;
      nextMessageIdRef.current = 1;
      setInputValue("");
      setMessages([]);
    }, 0);
  }, []);

  const handleInputValueChange = useCallback((nextValue: string) => {
    setInputValue(nextValue);
  }, []);

  const handleSubmitMessage = useCallback(() => {
    if (!isActive) {
      return;
    }

    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessageRow(trimmedValue)
    ]);
    setInputValue("");
    inputRef.current?.blur();
    scheduleScrollToLatest();
  }, [createMessageRow, inputValue, isActive, scheduleScrollToLatest]);

  useEffect(() => {
    return () => {
      clearScheduledTimeout(exitTimeoutRef);
      clearScheduledTimeout(interactionResetTimeoutRef);
      clearScheduledTimeout(latestScrollTimeoutRef);
      clearScheduledTimeout(phaseSyncTimeoutRef);
    };
  }, []);

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
