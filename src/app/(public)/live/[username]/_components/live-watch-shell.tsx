import type { ReactNode } from "react";

import styles from "./live-watch.module.css";
import { LiveWatchRouteShell } from "./live-watch-route-shell";

type LiveWatchShellProps = Readonly<{
  audioToggleEnabled: boolean;
  defaultCoverVisible: boolean;
  username: string;
  children: ReactNode;
}>;

export function LiveWatchShell({
  audioToggleEnabled,
  defaultCoverVisible,
  username,
  children
}: LiveWatchShellProps) {
  return (
    <main className={styles.page}>
      <LiveWatchRouteShell
        audioToggleEnabled={audioToggleEnabled}
        defaultCoverVisible={defaultCoverVisible}
        username={username}
      >
        {children}
      </LiveWatchRouteShell>
    </main>
  );
}
