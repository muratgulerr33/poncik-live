"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import styles from "./auth.module.css";

type AuthRouteShellProps = Readonly<{
  children: ReactNode;
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

export function AuthRouteShell({ children }: AuthRouteShellProps) {
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

  return (
    <>
      <div className={styles.chromeSlot}>
        <div className={styles.chromeBar}>
          <Link href="/" className={styles.brandLink}>
            <span className="t-h3">Poncik</span>
          </Link>

          <div className={styles.chromeActions}>
            <Link
              href="/auth"
              className={`${styles.accountSlot} ${styles.accountSlotCurrent}`.trim()}
              aria-current="page"
              aria-label="Hesap yüzeyindesiniz"
            >
              <UserRound className={styles.controlIcon} aria-hidden="true" />
            </Link>

            <button
              type="button"
              className={styles.chromeToggle}
              aria-controls={drawerId}
              aria-expanded={isDrawerOpen}
              aria-label="Gezinmeyi aç veya kapat"
              onClick={handleNavigationToggle}
            >
              <Menu className={styles.controlIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {children}

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
        aria-label="Auth gezinme"
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
