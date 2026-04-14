import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./studio.module.css";

type StudioRouteShellProps = Readonly<{
  children: ReactNode;
  statusLabel?: string;
  statusTone?: "idle" | "live" | "degraded";
  username?: string;
}>;

export function StudioRouteShell({
  children,
  statusLabel,
  statusTone,
  username
}: StudioRouteShellProps) {
  return (
    <section className={styles.shell}>
      <header className={styles.chrome} aria-label="Studyo ust denetimleri">
        <div className={styles.leadingCluster}>
          <Link
            aria-label="Studyo sahnesinden cik"
            className={styles.closeButton}
            href="/"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </Link>
          {username ? (
            <p className={`t-label ${styles.usernameLabel}`}>@{username}</p>
          ) : null}
        </div>

        {statusLabel ? (
          <span
            className={styles.statusIndicator}
            data-tone={statusTone ?? "idle"}
          >
            {statusLabel}
          </span>
        ) : null}
      </header>

      {children}
    </section>
  );
}
