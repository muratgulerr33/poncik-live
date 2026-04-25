"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./live-watch.module.css";
import { LiveWatchTopChrome } from "./LiveWatchTopChrome";

type LiveWatchRouteShellProps = Readonly<{
  children: ReactNode;
  username: string;
}>;

export function LiveWatchRouteShell({
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
    <div className={styles.shell}>
      <LiveWatchTopChrome
        onRequestClose={() => router.back()}
        username={username}
      />
      <div className={styles.contentStack}>{children}</div>
    </div>
  );
}
