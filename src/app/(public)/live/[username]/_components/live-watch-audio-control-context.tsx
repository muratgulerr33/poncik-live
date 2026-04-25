"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

type LiveWatchAudioControlContextValue = Readonly<{
  enabled: boolean;
  isMuted: boolean;
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
  const [isMuted, setIsMuted] = useState(false);

  const toggleMuted = useCallback(() => {
    setIsMuted((current) => !current);
  }, []);

  const value = useMemo<LiveWatchAudioControlContextValue>(
    () => ({
      enabled,
      isMuted,
      toggleMuted
    }),
    [enabled, isMuted, toggleMuted]
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
