"use client";

import { useMemo } from "react";
import { useState } from "react";

import { type AdminSurfaceView } from "../_controllers/auth-surface-view";
import { type PublisherSurfaceView } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthModeToggle } from "./AuthModeToggle";
import { AuthNotice } from "./AuthNotice";
import { type AuthRouteMenuItem } from "./auth-route-shell";
import { AuthRouteShell } from "./auth-route-shell";
import { CurrentSessionPanel } from "./CurrentSessionPanel";
import { PublisherRegisterForm } from "./PublisherRegisterForm";
import { SharedLoginForm } from "./SharedLoginForm";
import styles from "./auth.module.css";
import { UserRegisterForm } from "./UserRegisterForm";

type AuthShellProps = Readonly<{
  destination: string;
  primaryAction: {
    href: string;
    label: string;
  };
  adminSurface: AdminSurfaceView;
  currentSession: {
    email: string;
    username: string;
    roleType: string;
    accountStatus: string;
  } | null;
  degradedMessage: string | null;
  publisherSurface: PublisherSurfaceView;
}>;

export function AuthShell({
  destination,
  primaryAction,
  adminSurface,
  currentSession,
  degradedMessage,
  publisherSurface
}: AuthShellProps) {
  const [mode, setMode] = useState<"login" | "user-register" | "publisher-register">(
    "login"
  );
  const isPublisherSession = currentSession?.roleType === "publisher";
  const isSignedInNonPublisher = Boolean(currentSession && !isPublisherSession);
  const showHero = !isSignedInNonPublisher;
  const heroDescription = isPublisherSession ? null : AUTH_COPY.description;
  const menuItems = useMemo<AuthRouteMenuItem[]>(() => {
    if (!currentSession) {
      return [
        {
          type: "link",
          label: "Keşfet",
          href: "/"
        },
        {
          type: "link",
          label: "Giriş yap",
          href: "/auth",
          isCurrent: true
        },
        {
          type: "link",
          label: "Kayıt ol",
          href: "/auth"
        },
        {
          type: "link",
          label: "Sen de yayıncı ol",
          href: "/auth"
        },
        {
          type: "action",
          label: "Canlı Destek",
          actionId: "support"
        }
      ];
    }

    if (currentSession.roleType === "admin") {
      return [
        {
          type: "link",
          label: "Operasyon",
          href: "/auth",
          isCurrent: true
        },
        {
          type: "disabled",
          label: "Ödemeler"
        },
        {
          type: "disabled",
          label: "Raporlar"
        }
      ];
    }

    if (currentSession.roleType === "user") {
      return [
        {
          type: "link",
          label: "Keşfet",
          href: "/"
        },
        {
          type: "link",
          label: "Hesabım",
          href: "/auth",
          isCurrent: true
        },
        {
          type: "action",
          label: "Canlı Destek",
          actionId: "support"
        }
      ];
    }

    return [
      {
        type: "link",
        label: "Keşfet",
        href: "/"
      },
      ...(publisherSurface?.kind === "approved"
        ? [
            {
              type: "link" as const,
              label: "Canlı Yayın",
              href: primaryAction.href
            }
          ]
        : []),
      {
        type: "link",
        label: "Hesabım",
        href: "/auth",
        isCurrent: true
      },
      {
        type: "action",
        label: "Canlı Destek",
        actionId: "support"
      }
    ];
  }, [currentSession, primaryAction.href, publisherSurface]);

  return (
    <main className={styles.page}>
      <AuthRouteShell menuItems={menuItems}>
        <div className={styles.shell}>
          {showHero ? (
            <header
              className={`${styles.hero} ${
                isPublisherSession ? styles.heroCompact : ""
              }`.trim()}
            >
              <p className={`t-label ${styles.eyebrow}`}>
                {isPublisherSession
                  ? AUTH_COPY.publisherHeroEyebrow
                  : AUTH_COPY.eyebrow}
              </p>
              <h1 className="t-display">
                {isPublisherSession
                  ? AUTH_COPY.publisherHeroTitle
                  : AUTH_COPY.title}
              </h1>
              {heroDescription ? (
                <p className={`t-body ${styles.description}`}>{heroDescription}</p>
              ) : null}
            </header>
          ) : null}

          <section className={styles.card}>
            {degradedMessage ? (
              <AuthNotice
                title="Auth altyapısı şu anda sınırlı"
                body={degradedMessage}
                tone="info"
              />
            ) : null}
            {currentSession ? (
              <CurrentSessionPanel
                primaryActionHref={primaryAction.href}
                primaryActionLabel={primaryAction.label}
                adminSurface={adminSurface}
                currentSession={currentSession}
                publisherSurface={publisherSurface}
              />
            ) : (
              <>
                <AuthModeToggle mode={mode} onChange={setMode} />
                <h2 className={`t-h2 ${styles.panelTitle}`}>
                  {mode === "login"
                    ? AUTH_COPY.loginTitle
                    : mode === "user-register"
                      ? AUTH_COPY.userRegisterTitle
                      : AUTH_COPY.publisherRegisterTitle}
                </h2>
                <p className={`t-body ${styles.panelDescription}`}>
                  {mode === "login"
                    ? AUTH_COPY.loginDescription
                    : mode === "user-register"
                      ? AUTH_COPY.userRegisterDescription
                      : AUTH_COPY.publisherRegisterDescription}
                </p>
                {mode === "login" ? (
                  <SharedLoginForm next={destination} />
                ) : mode === "user-register" ? (
                  <UserRegisterForm next={destination} />
                ) : (
                  <PublisherRegisterForm />
                )}
              </>
            )}
          </section>
        </div>
      </AuthRouteShell>
    </main>
  );
}
