import type { ReactNode } from "react";

import styles from "./live-watch.module.css";
import { LiveWatchRouteShell } from "./live-watch-route-shell";

type LiveWatchShellProps = Readonly<{
  username: string;
  children: ReactNode;
}>;

export function LiveWatchShell({ username, children }: LiveWatchShellProps) {
  return (
    <main className={styles.page}>
      <LiveWatchRouteShell username={username}>{children}</LiveWatchRouteShell>
    </main>
  );
}
