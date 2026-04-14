"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { DiscoveryShell } from "./discovery-shell";
import styles from "./discovery.module.css";

type DiscoveryShellSession =
  | {
      kind: "authenticated";
      username: string;
    }
  | {
      kind: "anonymous" | "degraded";
    };

type DiscoveryRouteShellProps = Readonly<{
  children: ReactNode;
  session: DiscoveryShellSession;
}>;

const NAV_ITEMS = [
  {
    href: "/",
    label: "Keşif"
  },
  {
    href: "/auth",
    label: "Hesap"
  }
] as const;

export function DiscoveryRouteShell({
  children,
  session
}: DiscoveryRouteShellProps) {
  const pathname = usePathname();
  const drawerId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.drawerLink} ${
                  isActive ? styles.drawerLinkActive : ""
                }`.trim()}
                aria-current={isActive ? "page" : undefined}
                onClick={closeDrawer}
              >
                <span className="t-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
