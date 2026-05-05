"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type LiveWatchViewerCountMetric = Readonly<{
  accessibilityText: string;
  text: string;
}>;

type LiveWatchViewerCountContextValue = Readonly<{
  setViewerCountMetric: (metric: LiveWatchViewerCountMetric | null) => void;
  viewerCountMetric: LiveWatchViewerCountMetric | null;
}>;

const LiveWatchViewerCountContext =
  createContext<LiveWatchViewerCountContextValue | null>(null);

function isSameMetric(
  current: LiveWatchViewerCountMetric | null,
  next: LiveWatchViewerCountMetric | null
) {
  if (current === next) {
    return true;
  }

  if (!current || !next) {
    return false;
  }

  return (
    current.accessibilityText === next.accessibilityText &&
    current.text === next.text
  );
}

export function LiveWatchViewerCountProvider({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const [viewerCountMetric, setViewerCountMetricState] =
    useState<LiveWatchViewerCountMetric | null>(null);

  const setViewerCountMetric = useCallback(
    (metric: LiveWatchViewerCountMetric | null) => {
      setViewerCountMetricState((current) => {
        if (isSameMetric(current, metric)) {
          return current;
        }

        return metric;
      });
    },
    []
  );

  const value = useMemo<LiveWatchViewerCountContextValue>(
    () => ({
      setViewerCountMetric,
      viewerCountMetric
    }),
    [setViewerCountMetric, viewerCountMetric]
  );

  return (
    <LiveWatchViewerCountContext.Provider value={value}>
      {children}
    </LiveWatchViewerCountContext.Provider>
  );
}

export function useLiveWatchViewerCountContext() {
  const value = useContext(LiveWatchViewerCountContext);

  if (!value) {
    throw new Error(
      "useLiveWatchViewerCountContext must be used within the live watch viewer count provider."
    );
  }

  return value;
}
