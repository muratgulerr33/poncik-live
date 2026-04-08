"use client";

import { useState } from "react";

import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthModeToggle } from "./AuthModeToggle";
import { AuthNotice } from "./AuthNotice";
import { CurrentSessionPanel } from "./CurrentSessionPanel";
import { PublisherRegisterForm } from "./PublisherRegisterForm";
import { SharedLoginForm } from "./SharedLoginForm";
import styles from "./auth.module.css";
import { UserRegisterForm } from "./UserRegisterForm";

type AuthShellProps = Readonly<{
  destination: string;
  currentSession: {
    email: string;
    username: string;
    roleType: string;
    accountStatus: string;
  } | null;
  degradedMessage: string | null;
  publisherNotice:
    | {
        title: string;
        body: string;
      }
    | null;
}>;

export function AuthShell({
  destination,
  currentSession,
  degradedMessage,
  publisherNotice
}: AuthShellProps) {
  const [mode, setMode] = useState<"login" | "user-register" | "publisher-register">(
    "login"
  );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={`t-label ${styles.eyebrow}`}>{AUTH_COPY.eyebrow}</p>
          <h1 className="t-display">{AUTH_COPY.title}</h1>
          <p className={`t-body ${styles.description}`}>{AUTH_COPY.description}</p>
        </header>

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
              destination={destination}
              currentSession={currentSession}
              publisherNotice={publisherNotice}
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
    </main>
  );
}
