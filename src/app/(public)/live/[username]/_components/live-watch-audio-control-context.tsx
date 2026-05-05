"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type UnlockAudioAction = (() => Promise<boolean>) | null;

type LiveWatchAudioControlContextValue = Readonly<{
  enabled: boolean;
  isAudioBlocked: boolean;
  isIconMuted: boolean;
  isUserMuted: boolean;
  setAudioBlocked: (blocked: boolean) => void;
  setUnlockAudioAction: (action: UnlockAudioAction) => void;
  toggleMuted: () => void;
}>;

const LiveWatchAudioControlContext =
  createContext<LiveWatchAudioControlContextValue | null>(null);

export function LiveWatchAudioControlProvider({
  children,
  enabled
}: Readonly<{
  children: ReactNode;
  enabled: boolean;
}>) {
  const unlockAudioActionRef = useRef<UnlockAudioAction>(null);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [isUserMuted, setIsUserMuted] = useState(false);

  const setAudioBlocked = useCallback((blocked: boolean) => {
    setIsAudioBlocked(blocked);
  }, []);

  const setUnlockAudioAction = useCallback((action: UnlockAudioAction) => {
    unlockAudioActionRef.current = action;
  }, []);

  const isIconMuted = isUserMuted || isAudioBlocked;

  const toggleMuted = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (isAudioBlocked && unlockAudioActionRef.current) {
      void unlockAudioActionRef.current();
      return;
    }

    setIsUserMuted((current) => !current);
  }, [enabled, isAudioBlocked]);

  const value = useMemo<LiveWatchAudioControlContextValue>(
    () => ({
      enabled,
      isAudioBlocked,
      isIconMuted,
      isUserMuted,
      setAudioBlocked,
      setUnlockAudioAction,
      toggleMuted
    }),
    [
      enabled,
      isAudioBlocked,
      isIconMuted,
      isUserMuted,
      setAudioBlocked,
      setUnlockAudioAction,
      toggleMuted
    ]
  );

  return (
    <LiveWatchAudioControlContext.Provider value={value}>
      {children}
    </LiveWatchAudioControlContext.Provider>
  );
}

export function useLiveWatchAudioControl() {
  const value = useContext(LiveWatchAudioControlContext);

  if (!value) {
    throw new Error("useLiveWatchAudioControl must be used within the live watch audio provider.");
  }

  return value;
}
