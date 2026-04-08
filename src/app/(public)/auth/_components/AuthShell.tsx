"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signOutAction } from "../_actions/auth-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthModeToggle } from "./AuthModeToggle";
import { AuthNotice } from "./AuthNotice";
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
}>;

export function AuthShell({
  destination,
  currentSession,
  degradedMessage
}: AuthShellProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [signOutState, signOutFormAction, isSigningOut] = useActionState(
    signOutAction,
    INITIAL_AUTH_ACTION_STATE
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
            <>
              <h2 className={`t-h2 ${styles.panelTitle}`}>{AUTH_COPY.sessionTitle}</h2>
              <p className={`t-body ${styles.panelDescription}`}>
                {AUTH_COPY.sessionDescription}
              </p>
              <AuthNotice
                title={`@${currentSession.username}`}
                body={AUTH_COPY.sessionActiveBody}
                tone="info"
                meta={currentSession.email}
              />
              {signOutState.status === "error" && signOutState.message ? (
                <AuthNotice
                  title="Çıkış tamamlanamadı"
                  body={signOutState.message}
                  tone="error"
                />
              ) : null}
              <div className={styles.actionRow}>
                <Link href={destination} className={styles.action}>
                  {AUTH_COPY.continueLabel}
                </Link>
                <form action={signOutFormAction}>
                  <button
                    type="submit"
                    className={styles.secondaryAction}
                    disabled={isSigningOut}
                  >
                    {AUTH_COPY.signOutLabel}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <AuthModeToggle mode={mode} onChange={setMode} />
              <h2 className={`t-h2 ${styles.panelTitle}`}>
                {mode === "login" ? AUTH_COPY.loginTitle : AUTH_COPY.registerTitle}
              </h2>
              <p className={`t-body ${styles.panelDescription}`}>
                {mode === "login"
                  ? AUTH_COPY.loginDescription
                  : AUTH_COPY.registerDescription}
              </p>
              {mode === "login" ? (
                <SharedLoginForm next={destination} />
              ) : (
                <UserRegisterForm next={destination} />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
