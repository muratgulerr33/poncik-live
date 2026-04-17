"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { DiscoveryShell } from "./discovery-shell";
import { TawkSupportBoundary } from "./tawk-support-boundary";
import styles from "./discovery.module.css";

type DiscoveryShellSession =
  | {
      kind: "authenticated";
      username: string;
    }
  | {
      kind: "anonymous" | "degraded";
    };

export type DiscoveryRouteMenuItem =
  | {
      type: "link";
      label: string;
      href: string;
      isCurrent?: boolean;
    }
  | {
      type: "action";
      label: string;
      actionId: "support";
      isCurrent?: boolean;
    }
  | {
      type: "disabled";
      label: string;
      isCurrent?: boolean;
    };

type DiscoveryRouteShellProps = Readonly<{
  children: ReactNode;
  menuItems: DiscoveryRouteMenuItem[];
  session: DiscoveryShellSession;
}>;

export function DiscoveryRouteShell({
  children,
  menuItems,
  session
}: DiscoveryRouteShellProps) {
  const drawerId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [supportOpenSignal, setSupportOpenSignal] = useState(0);
  const [isSupportOpening, setIsSupportOpening] = useState(false);
  const hasSupportAction = menuItems.some(
    (item) => item.type === "action" && item.actionId === "support"
  );

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  function handleNavigationToggle() {
    setIsDrawerOpen((current) => !current);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function handleSupportRequest() {
    setIsSupportOpening(true);
    setIsDrawerOpen(false);
    setSupportOpenSignal((current) => current + 1);
  }

  const chrome = (
    <div className={styles.chromeBar}>
      <Link href="/" className={styles.brandLink}>
        <span className="t-h3">Poncik</span>
      </Link>

      <div className={styles.chromeActions}>
        <Link
          href="/auth"
          className={styles.accountSlot}
          aria-label={
            session.kind === "authenticated"
              ? `@${session.username} hesabına git`
              : "Hesap yüzeyine git"
          }
        >
          <UserRound className={styles.controlIcon} aria-hidden="true" />
        </Link>

        <button
          type="button"
          className={styles.chromeToggle}
          aria-controls={drawerId}
          aria-expanded={isDrawerOpen}
          data-drawer-open={isDrawerOpen ? "true" : "false"}
          aria-label="Gezinmeyi aç veya kapat"
          onClick={handleNavigationToggle}
        >
          <Menu className={styles.controlIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <DiscoveryShell chrome={chrome}>
        {children}
      </DiscoveryShell>

      <div
        className={`${styles.drawerBackdrop} ${
          isDrawerOpen ? styles.drawerBackdropOpen : ""
        }`.trim()}
        aria-hidden={isDrawerOpen ? "false" : "true"}
        onClick={closeDrawer}
      />

      <aside
        id={drawerId}
        className={`${styles.drawerPanel} ${
          isDrawerOpen ? styles.drawerPanelOpen : ""
        }`.trim()}
        aria-hidden={isDrawerOpen ? "false" : "true"}
        aria-label="Discovery gezinme"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.drawerHeader}>
          <span className={`t-label ${styles.drawerTitle}`}>Gezinme</span>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="Gezinmeyi kapat"
            onClick={closeDrawer}
          >
            <X className={styles.controlIcon} aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {menuItems.map((item) => {
            if (item.type === "link") {
              return (
              <Link
                key={`${item.type}:${item.label}`}
                href={item.href}
                className={`${styles.drawerLink} ${
                  item.isCurrent ? styles.drawerLinkActive : ""
                }`.trim()}
                aria-current={item.isCurrent ? "page" : undefined}
                onClick={closeDrawer}
              >
                <span className="t-label">{item.label}</span>
              </Link>
              );
            }

            if (item.type === "action") {
              return (
                <button
                  key={`${item.type}:${item.label}`}
                  type="button"
                  className={styles.drawerAction}
                  disabled={isSupportOpening}
                  onClick={handleSupportRequest}
                >
                  <span className="t-label">{item.label}</span>
                </button>
              );
            }

            return (
              <div
                key={`${item.type}:${item.label}`}
                className={styles.drawerDisabled}
                aria-disabled="true"
              >
                <span className="t-label">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {hasSupportAction ? (
        <TawkSupportBoundary
          enabled={true}
          openSignal={supportOpenSignal}
          onPhaseChange={(phase) => {
            setIsSupportOpening(phase === "opening");
          }}
        />
      ) : null}
    </>
  );
}
