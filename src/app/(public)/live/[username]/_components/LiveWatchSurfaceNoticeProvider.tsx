"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { LiveWatchSurfaceNotice } from "./LiveWatchSurfaceNotice";

type LiveWatchSurfaceNoticeTone = "success";
type LiveWatchSurfaceNoticePhase = "idle" | "visible" | "exiting";

type LiveWatchSurfaceNoticePayload = Readonly<{
  delayMs?: number;
  durationMs?: number;
  message: string;
  tone?: LiveWatchSurfaceNoticeTone;
}>;

type LiveWatchSurfaceNoticeContextValue = Readonly<{
  showNotice: (payload: LiveWatchSurfaceNoticePayload) => void;
}>;

type ActiveNotice = Readonly<{
  id: number;
  message: string;
  tone: LiveWatchSurfaceNoticeTone;
}>;

const DEFAULT_NOTICE_DELAY_MS = 0;
const DEFAULT_NOTICE_DURATION_MS = 2000;
const EXIT_FALLBACK_MS = 240;
const REDUCED_MOTION_EXIT_FALLBACK_MS = 32;

const LiveWatchSurfaceNoticeContext =
  createContext<LiveWatchSurfaceNoticeContextValue | null>(null);

function normalizeNoticeTimingValue(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value < 0 ? 0 : value;
}

export function LiveWatchSurfaceNoticeProvider({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const [noticeState, setNoticeState] = useState<ActiveNotice | null>(null);
  const [phaseState, setPhaseState] =
    useState<LiveWatchSurfaceNoticePhase>("idle");
  const noticeRef = useRef<ActiveNotice | null>(null);
  const phaseRef = useRef<LiveWatchSurfaceNoticePhase>("idle");
  const noticeIdSequenceRef = useRef(0);
  const delayTimeoutRef = useRef<number | null>(null);
  const durationTimeoutRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  const setNotice = useCallback((nextNotice: ActiveNotice | null) => {
    noticeRef.current = nextNotice;
    setNoticeState(nextNotice);
  }, []);

  const setPhase = useCallback((nextPhase: LiveWatchSurfaceNoticePhase) => {
    phaseRef.current = nextPhase;
    setPhaseState(nextPhase);
  }, []);

  const clearDelayTimer = useCallback(() => {
    if (delayTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(delayTimeoutRef.current);
    delayTimeoutRef.current = null;
  }, []);

  const clearDurationTimer = useCallback(() => {
    if (durationTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(durationTimeoutRef.current);
    durationTimeoutRef.current = null;
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = null;
  }, []);

  const clearTimers = useCallback(() => {
    clearDelayTimer();
    clearDurationTimer();
    clearExitTimer();
  }, [clearDelayTimer, clearDurationTimer, clearExitTimer]);

  const getExitFallbackDuration = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return REDUCED_MOTION_EXIT_FALLBACK_MS;
    }

    return EXIT_FALLBACK_MS;
  }, []);

  const completeExit = useCallback(
    (noticeId: number) => {
      if (noticeRef.current?.id !== noticeId || phaseRef.current !== "exiting") {
        return;
      }

      clearExitTimer();
      setPhase("idle");
      setNotice(null);
    },
    [clearExitTimer, setNotice, setPhase]
  );

  const beginExit = useCallback(
    (noticeId: number) => {
      if (noticeRef.current?.id !== noticeId) {
        return;
      }

      clearDurationTimer();
      clearExitTimer();
      setPhase("exiting");
      exitTimeoutRef.current = window.setTimeout(() => {
        completeExit(noticeId);
      }, getExitFallbackDuration());
    },
    [clearDurationTimer, clearExitTimer, completeExit, getExitFallbackDuration, setPhase]
  );

  const startDurationTimer = useCallback(
    (noticeId: number, durationMs: number) => {
      clearDurationTimer();
      durationTimeoutRef.current = window.setTimeout(() => {
        beginExit(noticeId);
      }, durationMs);
    },
    [beginExit, clearDurationTimer]
  );

  const showNotice = useCallback(
    (payload: LiveWatchSurfaceNoticePayload) => {
      const trimmedMessage = payload.message.trim();

      if (!trimmedMessage) {
        return;
      }

      const delayMs = normalizeNoticeTimingValue(
        payload.delayMs,
        DEFAULT_NOTICE_DELAY_MS
      );
      const durationMs = normalizeNoticeTimingValue(
        payload.durationMs,
        DEFAULT_NOTICE_DURATION_MS
      );
      const noticeId = noticeIdSequenceRef.current + 1;

      noticeIdSequenceRef.current = noticeId;
      clearTimers();

      setNotice({
        id: noticeId,
        message: trimmedMessage,
        tone: payload.tone ?? "success"
      });
      setPhase("idle");

      const revealNotice = () => {
        if (noticeRef.current?.id !== noticeId) {
          return;
        }

        setPhase("visible");
        startDurationTimer(noticeId, durationMs);
      };

      if (delayMs === 0) {
        revealNotice();
        return;
      }

      delayTimeoutRef.current = window.setTimeout(() => {
        revealNotice();
      }, delayMs);
    },
    [clearTimers, setNotice, setPhase, startDurationTimer]
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const value = useMemo<LiveWatchSurfaceNoticeContextValue>(
    () => ({
      showNotice
    }),
    [showNotice]
  );

  return (
    <LiveWatchSurfaceNoticeContext.Provider value={value}>
      {children}
      {noticeState && phaseState !== "idle" ? (
        <LiveWatchSurfaceNotice
          message={noticeState.message}
          onExitComplete={
            phaseState === "exiting"
              ? () => {
                  completeExit(noticeState.id);
                }
              : undefined
          }
          phase={phaseState}
          tone={noticeState.tone}
        />
      ) : null}
    </LiveWatchSurfaceNoticeContext.Provider>
  );
}

export function useLiveWatchSurfaceNotice() {
  const value = useContext(LiveWatchSurfaceNoticeContext);

  if (!value) {
    throw new Error(
      "useLiveWatchSurfaceNotice must be used within the live watch surface notice provider."
    );
  }

  return value;
}
