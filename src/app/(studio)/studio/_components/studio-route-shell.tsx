"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import {
  StudioTopChrome,
  type StudioLiveMicControl
} from "./StudioTopChrome";
import styles from "./studio.module.css";

type StudioRouteShellProps = Readonly<{
  children: ReactNode;
  closeDisabled?: boolean;
  closeHref?: string;
  layout?: "page" | "scene";
  liveMicControl?: StudioLiveMicControl | null;
  onRequestClose?: () => void;
  surface?: "default" | "approved";
  username?: string;
}>;

export function StudioRouteShell({
  children,
  closeDisabled = false,
  closeHref = "/",
  layout = "page",
  liveMicControl = null,
  onRequestClose,
  surface = "default",
  username
}: StudioRouteShellProps) {
  const isApprovedSceneChrome = layout === "scene" && surface === "approved";
  const chrome = (
    <header
      className={styles.chrome}
      data-layout={layout}
      data-surface={surface}
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
    </header>
  );

  return (
    <section
      className={styles.shell}
      data-layout={layout}
      data-surface={surface}
    >
      {layout === "scene" ? null : chrome}
      <div className={styles.shellScene} data-layout={layout}>
        {children}
        {isApprovedSceneChrome && onRequestClose ? (
          <StudioTopChrome
            closeDisabled={closeDisabled}
            liveMicControl={liveMicControl}
            onRequestClose={onRequestClose}
            username={username}
          />
        ) : layout === "scene" ? (
          chrome
        ) : null}
      </div>
    </section>
  );
}
