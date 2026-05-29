"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type StartSuccessFeedbackSnapshot = {
  isVisible: boolean;
  token: number;
  visibleUntil: number;
};

const START_SUCCESS_FEEDBACK_DURATION_MS = 1800;

let startSuccessFeedbackSnapshot: StartSuccessFeedbackSnapshot = {
  isVisible: false,
  token: 0,
  visibleUntil: 0
};
let startSuccessFeedbackDeferredClearTimeout: ReturnType<typeof setTimeout> | null =
  null;

function cancelStartSuccessFeedbackDeferredClear() {
  if (!startSuccessFeedbackDeferredClearTimeout) {
    return;
  }

  clearTimeout(startSuccessFeedbackDeferredClearTimeout);
  startSuccessFeedbackDeferredClearTimeout = null;
}

function clearStartSuccessFeedbackSnapshot() {
  startSuccessFeedbackSnapshot = {
    isVisible: false,
    token: 0,
    visibleUntil: 0
  };
}

function hasActiveStartSuccessFeedbackSnapshot(token: number) {
  return (
    startSuccessFeedbackSnapshot.isVisible &&
    startSuccessFeedbackSnapshot.token === token &&
    startSuccessFeedbackSnapshot.visibleUntil > Date.now()
  );
}

function scheduleStartSuccessFeedbackDeferredClear() {
  cancelStartSuccessFeedbackDeferredClear();
  startSuccessFeedbackDeferredClearTimeout = setTimeout(() => {
    clearStartSuccessFeedbackSnapshot();
    startSuccessFeedbackDeferredClearTimeout = null;
  }, 0);
}

type UseStudioStartSuccessFeedbackArgs = Readonly<{
  clearSecondTriggerBlockResetTimeout: () => void;
  startSuccessSequence: number;
}>;

export function useStudioStartSuccessFeedback({
  clearSecondTriggerBlockResetTimeout,
  startSuccessSequence
}: UseStudioStartSuccessFeedbackArgs) {
  const [hasVisibleStartSuccessFeedback, setHasVisibleStartSuccessFeedback] =
    useState(false);
  const [visibleSuccessToken, setVisibleSuccessToken] = useState(0);
  const lastConsumedStartSuccessSequenceRef = useRef(0);
  const startSuccessFeedbackSyncTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSuccessFeedbackHideTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const [initialStartSuccessSequence] = useState(startSuccessSequence);

  const clearStartSuccessFeedbackSyncTimeout = useCallback(() => {
    if (!startSuccessFeedbackSyncTimeoutRef.current) {
      return;
    }

    clearTimeout(startSuccessFeedbackSyncTimeoutRef.current);
    startSuccessFeedbackSyncTimeoutRef.current = null;
  }, []);

  const clearStartSuccessFeedbackHideTimeout = useCallback(() => {
    if (!startSuccessFeedbackHideTimeoutRef.current) {
      return;
    }

    clearTimeout(startSuccessFeedbackHideTimeoutRef.current);
    startSuccessFeedbackHideTimeoutRef.current = null;
  }, []);

  const hideStartSuccessFeedback = useCallback(
    (token: number, visibleUntil: number) => {
      clearStartSuccessFeedbackHideTimeout();
      startSuccessFeedbackSnapshot = {
        isVisible: false,
        token,
        visibleUntil
      };
      setHasVisibleStartSuccessFeedback(false);
      setVisibleSuccessToken(token);
    },
    [clearStartSuccessFeedbackHideTimeout]
  );

  const showStartSuccessFeedbackWindow = useCallback(
    (token: number, visibleUntil: number) => {
      cancelStartSuccessFeedbackDeferredClear();
      clearStartSuccessFeedbackHideTimeout();
      startSuccessFeedbackSnapshot = {
        isVisible: true,
        token,
        visibleUntil
      };
      setVisibleSuccessToken(token);
      setHasVisibleStartSuccessFeedback(true);

      const remainingDuration = Math.max(visibleUntil - Date.now(), 0);

      if (remainingDuration === 0) {
        hideStartSuccessFeedback(token, visibleUntil);
        return;
      }

      startSuccessFeedbackHideTimeoutRef.current = setTimeout(() => {
        hideStartSuccessFeedback(token, visibleUntil);
      }, remainingDuration);
    },
    [clearStartSuccessFeedbackHideTimeout, hideStartSuccessFeedback]
  );

  useEffect(() => {
    cancelStartSuccessFeedbackDeferredClear();
    clearStartSuccessFeedbackSyncTimeout();

    if (hasActiveStartSuccessFeedbackSnapshot(initialStartSuccessSequence)) {
      startSuccessFeedbackSyncTimeoutRef.current = setTimeout(() => {
        startSuccessFeedbackSyncTimeoutRef.current = null;
        showStartSuccessFeedbackWindow(
          initialStartSuccessSequence,
          startSuccessFeedbackSnapshot.visibleUntil
        );
      }, 0);
    }

    lastConsumedStartSuccessSequenceRef.current = initialStartSuccessSequence;

    return () => {
      clearSecondTriggerBlockResetTimeout();
      clearStartSuccessFeedbackHideTimeout();
      clearStartSuccessFeedbackSyncTimeout();
      scheduleStartSuccessFeedbackDeferredClear();
    };
  }, [
    clearSecondTriggerBlockResetTimeout,
    clearStartSuccessFeedbackHideTimeout,
    clearStartSuccessFeedbackSyncTimeout,
    initialStartSuccessSequence,
    showStartSuccessFeedbackWindow
  ]);

  useEffect(() => {
    if (
      startSuccessSequence <= lastConsumedStartSuccessSequenceRef.current ||
      hasActiveStartSuccessFeedbackSnapshot(startSuccessSequence)
    ) {
      return;
    }

    lastConsumedStartSuccessSequenceRef.current = startSuccessSequence;
    clearStartSuccessFeedbackSyncTimeout();
    startSuccessFeedbackSyncTimeoutRef.current = setTimeout(() => {
      startSuccessFeedbackSyncTimeoutRef.current = null;
      showStartSuccessFeedbackWindow(
        startSuccessSequence,
        Date.now() + START_SUCCESS_FEEDBACK_DURATION_MS
      );
    }, 0);
  }, [
    clearStartSuccessFeedbackSyncTimeout,
    showStartSuccessFeedbackWindow,
    startSuccessSequence
  ]);

  return hasVisibleStartSuccessFeedback && visibleSuccessToken === startSuccessSequence;
}
