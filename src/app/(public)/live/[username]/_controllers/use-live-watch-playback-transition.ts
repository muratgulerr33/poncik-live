"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SPINNER_RECOVERY_TIMEOUT_MS = 1500;

type LiveWatchPlaybackState =
  | "connecting"
  | "playing"
  | "playback_blocked"
  | "degraded";

type LiveWatchPlaybackTransitionInput = Readonly<{
  liveStatusCheckRequestSequence: number;
  mediaReady: boolean;
  playbackMessage: string | null;
  playbackState: LiveWatchPlaybackState;
}>;

export function useLiveWatchPlaybackTransition({
  liveStatusCheckRequestSequence,
  mediaReady,
  playbackMessage,
  playbackState
}: LiveWatchPlaybackTransitionInput) {
  const [recoveredSequence, setRecoveredSequence] = useState(0);
  const lastHandledRefreshSequenceRef = useRef(0);
  const lastScheduledRecoverySequenceRef = useRef(0);
  const recoveryTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const isMediaSettled = playbackState === "playing" && mediaReady;

  useEffect(() => {
    if (
      liveStatusCheckRequestSequence === 0 ||
      lastHandledRefreshSequenceRef.current === liveStatusCheckRequestSequence
    ) {
      return;
    }

    lastHandledRefreshSequenceRef.current = liveStatusCheckRequestSequence;

    if (document.visibilityState !== "visible") {
      return;
    }

    router.refresh();
  }, [liveStatusCheckRequestSequence, router]);

  useEffect(() => {
    if (!isMediaSettled) {
      return;
    }

    if (recoveryTimeoutRef.current !== null) {
      window.clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }

    if (recoveredSequence >= liveStatusCheckRequestSequence) {
      return;
    }

    const recoverySyncTimeout = window.setTimeout(() => {
      setRecoveredSequence((currentSequence) =>
        currentSequence < liveStatusCheckRequestSequence
          ? liveStatusCheckRequestSequence
          : currentSequence
      );
    }, 0);

    return () => {
      window.clearTimeout(recoverySyncTimeout);
    };
  }, [isMediaSettled, liveStatusCheckRequestSequence, recoveredSequence]);

  useEffect(() => {
    if (
      isMediaSettled ||
      playbackState === "playback_blocked" ||
      liveStatusCheckRequestSequence === 0 ||
      liveStatusCheckRequestSequence <= recoveredSequence ||
      lastScheduledRecoverySequenceRef.current === liveStatusCheckRequestSequence
    ) {
      return;
    }

    lastScheduledRecoverySequenceRef.current = liveStatusCheckRequestSequence;
    recoveryTimeoutRef.current = window.setTimeout(() => {
      recoveryTimeoutRef.current = null;
      setRecoveredSequence((currentSequence) =>
        currentSequence < liveStatusCheckRequestSequence
          ? liveStatusCheckRequestSequence
          : currentSequence
      );
    }, SPINNER_RECOVERY_TIMEOUT_MS);

    return () => {
      if (recoveryTimeoutRef.current !== null) {
        window.clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    };
  }, [isMediaSettled, liveStatusCheckRequestSequence, playbackState, recoveredSequence]);

  const isStatusCheckPending =
    !isMediaSettled && liveStatusCheckRequestSequence > recoveredSequence;
  const shouldShowMessageFallback =
    playbackState === "playback_blocked" ||
    (playbackState === "degraded" && !isStatusCheckPending && playbackMessage !== null);
  const overlayMode =
    shouldShowMessageFallback
      ? "message"
      : playbackState !== "playing" || !mediaReady
        ? "spinner_only"
        : "hidden";
  const isChatVisible = playbackState === "playing" && mediaReady;

  return {
    isChatVisible,
    overlayAccessibleLabel:
      overlayMode === "spinner_only" ? "Yayın durumu güncelleniyor" : null,
    overlayMode
  } as const;
}
