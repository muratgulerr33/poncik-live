"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const STUDIO_REFRESH_INTERVAL_MS = 10000;
const REFRESH_COALESCE_MS = 900;

export function StudioFreshness() {
  const router = useRouter();
  const intervalIdRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

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
      }, STUDIO_REFRESH_INTERVAL_MS);
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
      if (!isPageVisible()) {
        stopInterval();
        return;
      }

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
  }, [isPageVisible, requestFreshness]);

  return null;
}
