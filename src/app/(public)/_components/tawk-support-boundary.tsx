"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const TAWK_SCRIPT_ID = "poncik-tawk-script";
const TAWK_SCRIPT_SRC =
  "https://embed.tawk.to/69e137d3f337951c3c3cd295/1jmbs453e";
const OPENING_FAILSAFE_MS = 3000;

type TawkPhase = "idle" | "opening" | "open";

type TawkApi = {
  hideWidget?: () => void;
  maximize?: () => void;
  onChatHidden?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onLoad?: () => void;
  showWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
    __poncikTawkWidgetReady?: boolean;
  }
}

type TawkSupportBoundaryProps = Readonly<{
  enabled: boolean;
  openSignal: number;
  onPhaseChange?: (phase: TawkPhase) => void;
}>;

function getTawkApi(): TawkApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  window.Tawk_API = window.Tawk_API || {};
  return window.Tawk_API;
}

function hasWidgetMethods(api: TawkApi | null) {
  return Boolean(api?.showWidget && api.maximize && api.hideWidget);
}

export function TawkSupportBoundary({
  enabled,
  openSignal,
  onPhaseChange
}: TawkSupportBoundaryProps) {
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const api = getTawkApi();
    return Boolean(window.__poncikTawkWidgetReady && hasWidgetMethods(api));
  });
  const [pendingOpen, setPendingOpen] = useState(false);
  const [phase, setPhase] = useState<TawkPhase>("idle");
  const phaseChangeRef = useRef(onPhaseChange);
  const pendingOpenRef = useRef(false);

  useEffect(() => {
    phaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    phaseChangeRef.current?.(phase);
  }, [phase]);

  useEffect(() => {
    pendingOpenRef.current = pendingOpen;
  }, [pendingOpen]);

  const resetToIdle = useCallback((hideWidget: boolean) => {
    const api = getTawkApi();
    if (hideWidget) {
      api?.hideWidget?.();
    }
    setPendingOpen(false);
    setPhase("idle");
  }, []);

  const tryOpenWidget = useCallback(() => {
    const api = getTawkApi();

    if (!api || !ready || !hasWidgetMethods(api)) {
      return false;
    }

    api.showWidget?.();
    api.maximize?.();
    return true;
  }, [ready]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const api = getTawkApi();
    if (!api) {
      return;
    }

    const previousOnLoad = api.onLoad;
    const previousOnChatMaximized = api.onChatMaximized;
    const previousOnChatMinimized = api.onChatMinimized;
    const previousOnChatHidden = api.onChatHidden;

    const handleLoad = () => {
      previousOnLoad?.();
      window.__poncikTawkWidgetReady = true;
      setReady(true);
    };

    const handleChatMaximized = () => {
      previousOnChatMaximized?.();
      setPendingOpen(false);
      setPhase("open");
    };

    const handleChatMinimized = () => {
      previousOnChatMinimized?.();
      resetToIdle(true);
    };

    const handleChatHidden = () => {
      previousOnChatHidden?.();
      setPendingOpen(false);
      setPhase("idle");
    };

    api.onLoad = handleLoad;
    api.onChatMaximized = handleChatMaximized;
    api.onChatMinimized = handleChatMinimized;
    api.onChatHidden = handleChatHidden;

    return () => {
      if (api.onLoad === handleLoad) {
        api.onLoad = previousOnLoad;
      }
      if (api.onChatMaximized === handleChatMaximized) {
        api.onChatMaximized = previousOnChatMaximized;
      }
      if (api.onChatMinimized === handleChatMinimized) {
        api.onChatMinimized = previousOnChatMinimized;
      }
      if (api.onChatHidden === handleChatHidden) {
        api.onChatHidden = previousOnChatHidden;
      }

      api.hideWidget?.();
    };
  }, [enabled, resetToIdle]);

  useEffect(() => {
    if (!enabled || openSignal === 0) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setPhase("opening");

      if (tryOpenWidget()) {
        return;
      }

      setPendingOpen(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, openSignal, tryOpenWidget]);

  useEffect(() => {
    if (!enabled || !ready || !pendingOpen) {
      return;
    }

    if (!tryOpenWidget()) {
      return;
    }
  }, [enabled, pendingOpen, ready, tryOpenWidget]);

  useEffect(() => {
    if (phase !== "opening") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (pendingOpenRef.current) {
        resetToIdle(false);
      }
    }, OPENING_FAILSAFE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase, resetToIdle]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      return;
    }

    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
  }, [enabled]);

  return enabled ? (
    <Script
      id={TAWK_SCRIPT_ID}
      src={TAWK_SCRIPT_SRC}
      strategy="afterInteractive"
    />
  ) : null;
}
