"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type StudioMicStartSnapshot = Readonly<{
  initialMicMuted: boolean;
}>;

type UseStudioPreviewStartActionArgs = Readonly<{
  captureMicStartSnapshot: () => StudioMicStartSnapshot | null;
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStarting: boolean;
  reportStartError: () => void;
  startPublishing: (args: { initialMicMuted: boolean }) => Promise<void>;
}>;

type UseStudioPreviewStartActionResult = Readonly<{
  clearSecondTriggerBlockResetTimeout: () => void;
  handleStartPublishing: () => void;
  isStartActionPending: boolean;
}>;

export function useStudioPreviewStartAction({
  captureMicStartSnapshot,
  effectiveLifecycleKind,
  isStarting,
  reportStartError,
  startPublishing
}: UseStudioPreviewStartActionArgs): UseStudioPreviewStartActionResult {
  const [isSecondTriggerBlockActive, setIsSecondTriggerBlockActive] = useState(false);
  const hasSecondTriggerBlockSeenStartProgressRef = useRef(false);
  const secondTriggerBlockResetTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSecondTriggerBlockResetTimeout = useCallback(() => {
    if (!secondTriggerBlockResetTimeoutRef.current) {
      return;
    }

    clearTimeout(secondTriggerBlockResetTimeoutRef.current);
    secondTriggerBlockResetTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    if (isSecondTriggerBlockActive && (isStarting || effectiveLifecycleKind === "live")) {
      hasSecondTriggerBlockSeenStartProgressRef.current = true;
    }

    const shouldResetSecondTriggerBlock =
      isSecondTriggerBlockActive &&
      hasSecondTriggerBlockSeenStartProgressRef.current &&
      !isStarting &&
      effectiveLifecycleKind !== "live";

    if (!shouldResetSecondTriggerBlock) {
      clearSecondTriggerBlockResetTimeout();
      return;
    }

    if (secondTriggerBlockResetTimeoutRef.current) {
      return;
    }

    secondTriggerBlockResetTimeoutRef.current = setTimeout(() => {
      secondTriggerBlockResetTimeoutRef.current = null;
      hasSecondTriggerBlockSeenStartProgressRef.current = false;
      setIsSecondTriggerBlockActive(false);
    }, 0);
  }, [
    clearSecondTriggerBlockResetTimeout,
    effectiveLifecycleKind,
    isSecondTriggerBlockActive,
    isStarting
  ]);

  const handleStartPublishing = useCallback(() => {
    if (isSecondTriggerBlockActive) {
      return;
    }

    const startSnapshot = captureMicStartSnapshot();

    if (!startSnapshot) {
      reportStartError();
      return;
    }

    hasSecondTriggerBlockSeenStartProgressRef.current = false;
    setIsSecondTriggerBlockActive(true);
    void startPublishing({
      initialMicMuted: startSnapshot.initialMicMuted
    });
  }, [
    captureMicStartSnapshot,
    isSecondTriggerBlockActive,
    reportStartError,
    startPublishing
  ]);

  return {
    clearSecondTriggerBlockResetTimeout,
    handleStartPublishing,
    isStartActionPending: isStarting || isSecondTriggerBlockActive
  };
}
