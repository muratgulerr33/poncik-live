"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type LiveWatchTransitionCoverContextValue = Readonly<{
  isCoverVisible: boolean;
  resetCoverVisible: () => void;
  setCoverVisible: (visible: boolean) => void;
}>;

const LiveWatchTransitionCoverContext =
  createContext<LiveWatchTransitionCoverContextValue | null>(null);

type LiveWatchTransitionCoverProviderProps = Readonly<{
  children: ReactNode;
  defaultCoverVisible: boolean;
}>;

export function LiveWatchTransitionCoverProvider({
  children,
  defaultCoverVisible
}: LiveWatchTransitionCoverProviderProps) {
  const defaultCoverVisibleRef = useRef(defaultCoverVisible);
  const [isCoverVisible, setIsCoverVisible] = useState(defaultCoverVisible);

  useClientLayoutEffect(() => {
    defaultCoverVisibleRef.current = defaultCoverVisible;
    setIsCoverVisible(defaultCoverVisible);
  }, [defaultCoverVisible]);

  const setCoverVisible = useCallback((visible: boolean) => {
    setIsCoverVisible(visible);
  }, []);

  const resetCoverVisible = useCallback(() => {
    setIsCoverVisible(defaultCoverVisibleRef.current);
  }, []);

  const value = useMemo(
    () => ({
      isCoverVisible,
      resetCoverVisible,
      setCoverVisible
    }),
    [isCoverVisible, resetCoverVisible, setCoverVisible]
  );

  return (
    <LiveWatchTransitionCoverContext.Provider value={value}>
      {children}
    </LiveWatchTransitionCoverContext.Provider>
  );
}

export function useLiveWatchTransitionCoverContext() {
  const context = useContext(LiveWatchTransitionCoverContext);

  if (context === null) {
    throw new Error(
      "useLiveWatchTransitionCoverContext must be used within LiveWatchTransitionCoverProvider"
    );
  }

  return context;
}
