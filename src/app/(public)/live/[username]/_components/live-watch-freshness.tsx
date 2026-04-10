"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const LIVE_REFRESH_INTERVAL_MS = 5000;
const NON_LIVE_REFRESH_INTERVAL_MS = 10000;
const REFRESH_COALESCE_MS = 900;

type LiveWatchFreshnessMode = "live" | "non_live";

type LiveWatchFreshnessProps = Readonly<{
  mode: LiveWatchFreshnessMode;
}>;

function getRefreshInterval(mode: LiveWatchFreshnessMode) {
  return mode === "live"
    ? LIVE_REFRESH_INTERVAL_MS
    : NON_LIVE_REFRESH_INTERVAL_MS;
}

export function LiveWatchFreshness({ mode }: LiveWatchFreshnessProps) {
  const router = useRouter();
  const intervalIdRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);
  const refreshIntervalMs = getRefreshInterval(mode);

  const isPageVisible = useCallback(() => {
    return document.visibilityState === "visible";
  }, []);

  const requestFreshness = useCallback(() => {
    if (!isPageVisible()) {
      return;
    }

    const now = Date.now();

    if (now - lastRefreshAtRef.current < REFRESH_COALESCE_MS) {
      return;
    }

    lastRefreshAtRef.current = now;
    router.refresh();
  }, [isPageVisible, router]);

  useEffect(() => {
    function stopInterval() {
      if (intervalIdRef.current === null) {
        return;
      }

      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    function startInterval() {
      stopInterval();

      if (!isPageVisible()) {
        return;
      }

      intervalIdRef.current = window.setInterval(() => {
        if (!isPageVisible()) {
          stopInterval();
          return;
        }

        requestFreshness();
      }, refreshIntervalMs);
    }

    function handleVisibleEvent() {
      if (!isPageVisible()) {
        stopInterval();
        return;
      }

      requestFreshness();
      startInterval();
    }

    function handleVisibilityChange() {
      handleVisibleEvent();
    }

    startInterval();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibleEvent);
    window.addEventListener("pagehide", stopInterval);
    window.addEventListener("pageshow", handleVisibleEvent);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibleEvent);
      window.removeEventListener("pagehide", stopInterval);
      window.removeEventListener("pageshow", handleVisibleEvent);
    };
  }, [isPageVisible, refreshIntervalMs, requestFreshness]);

  return null;
}
