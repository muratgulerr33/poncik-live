"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import {
  StudioTopChrome,
  type StudioCameraControl,
  type StudioMicControl
} from "./StudioTopChrome";
import styles from "./studio.module.css";

type StudioRouteShellProps = Readonly<{
  cameraControl?: StudioCameraControl | null;
  children: ReactNode;
  closeDisabled?: boolean;
  closeHref?: string;
  layout?: "page" | "scene";
  micControl?: StudioMicControl | null;
  onRequestClose?: () => void;
  surface?: "default" | "approved";
  username?: string;
}>;

export function StudioRouteShell({
  cameraControl = null,
  children,
  closeDisabled = false,
  closeHref = "/",
  layout = "page",
  micControl = null,
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
            cameraControl={cameraControl}
            closeDisabled={closeDisabled}
            micControl={micControl}
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
