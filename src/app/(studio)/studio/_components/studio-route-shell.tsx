"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./studio.module.css";

type StudioRouteShellProps = Readonly<{
  children: ReactNode;
  closeDisabled?: boolean;
  closeHref?: string;
  layout?: "page" | "scene";
  onRequestClose?: () => void;
  statusLabel?: string;
  statusTone?: "idle" | "live" | "degraded";
  username?: string;
}>;

export function StudioRouteShell({
  children,
  closeDisabled = false,
  closeHref = "/",
  layout = "page",
  onRequestClose,
  statusLabel,
  statusTone,
  username
}: StudioRouteShellProps) {
  const chrome = (
    <header
      className={styles.chrome}
      data-layout={layout}
      aria-label="Studyo ust denetimleri"
    >
      <div className={styles.leadingCluster}>
        {onRequestClose ? (
          <button
            aria-label="Studyo sahnesinden cik"
            className={styles.closeButton}
            disabled={closeDisabled}
            onClick={onRequestClose}
            type="button"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        ) : (
          <Link
            aria-label="Studyo sahnesinden cik"
            className={styles.closeButton}
            href={closeHref}
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </Link>
        )}
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
  );

  return (
    <section className={styles.shell} data-layout={layout}>
      {layout === "scene" ? null : chrome}
      <div className={styles.shellScene} data-layout={layout}>
        {children}
        {layout === "scene" ? chrome : null}
      </div>
    </section>
  );
}
