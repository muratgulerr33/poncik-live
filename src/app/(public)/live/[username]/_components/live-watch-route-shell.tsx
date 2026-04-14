"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./live-watch.module.css";

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
      <header className={styles.chrome} aria-label="Canli yayin ust denetimleri">
        <div className={styles.leadingCluster}>
          <button
            aria-label="Canli yayini kapat"
            className={styles.closeButton}
            onClick={() => router.back()}
            type="button"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
          <p className={`t-label ${styles.usernameLabel}`}>@{username}</p>
        </div>
      </header>

      <div className={styles.contentStack}>{children}</div>
    </div>
  );
}
