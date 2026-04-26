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
  playbackState: LiveWatchPlaybackState;
}>;

export function useLiveWatchPlaybackTransition({
  liveStatusCheckRequestSequence,
  playbackState
}: LiveWatchPlaybackTransitionInput) {
  const [recoveredSequence, setRecoveredSequence] = useState(0);
  const lastHandledRefreshSequenceRef = useRef(0);
  const lastScheduledRecoverySequenceRef = useRef(0);
  const recoveryTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

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
    if (playbackState !== "playing") {
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
  }, [liveStatusCheckRequestSequence, playbackState, recoveredSequence]);

  useEffect(() => {
    if (
      playbackState === "playing" ||
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
  }, [liveStatusCheckRequestSequence, playbackState, recoveredSequence]);

  const isSpinnerOnly =
    playbackState !== "playing" &&
    liveStatusCheckRequestSequence > recoveredSequence;

  return {
    overlayAccessibleLabel: isSpinnerOnly
      ? "Yayın durumu güncelleniyor"
      : null,
    overlayMode: isSpinnerOnly ? "spinner_only" : "message"
  } as const;
}
