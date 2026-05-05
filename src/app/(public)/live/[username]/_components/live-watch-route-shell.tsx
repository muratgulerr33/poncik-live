"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./live-watch.module.css";
import {
  LiveWatchAudioControlProvider,
  useLiveWatchAudioControl
} from "./live-watch-audio-control-context";
import {
  LiveWatchViewerCountProvider,
  useLiveWatchViewerCountContext
} from "./live-watch-viewer-count-context";
import { LiveWatchSurfaceNoticeProvider } from "./LiveWatchSurfaceNoticeProvider";
import { LiveWatchTopChrome } from "./LiveWatchTopChrome";

type LiveWatchRouteShellProps = Readonly<{
  audioToggleEnabled: boolean;
  children: ReactNode;
  username: string;
}>;

function LiveWatchTopChromeBridge({
  onRequestClose,
  username
}: Readonly<{
  onRequestClose: () => void;
  username: string;
}>) {
  const audioControl = useLiveWatchAudioControl();
  const { viewerCountMetric } = useLiveWatchViewerCountContext();

  return (
    <LiveWatchTopChrome
      audioControl={
        audioControl.enabled
          ? {
              enabled: true,
              isMuted: audioControl.isIconMuted,
              onToggleMuted: audioControl.toggleMuted
            }
          : undefined
      }
      onRequestClose={onRequestClose}
      username={username}
      viewerCountMetric={viewerCountMetric}
    />
  );
}

export function LiveWatchRouteShell({
  audioToggleEnabled,
  children,
  username
}: LiveWatchRouteShellProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.back();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return (
    <LiveWatchAudioControlProvider enabled={audioToggleEnabled}>
      <LiveWatchViewerCountProvider>
        <LiveWatchSurfaceNoticeProvider>
          <div className={styles.shell}>
            <LiveWatchTopChromeBridge
              onRequestClose={() => router.back()}
              username={username}
            />
            <div className={styles.contentStack}>{children}</div>
          </div>
        </LiveWatchSurfaceNoticeProvider>
      </LiveWatchViewerCountProvider>
    </LiveWatchAudioControlProvider>
  );
}
