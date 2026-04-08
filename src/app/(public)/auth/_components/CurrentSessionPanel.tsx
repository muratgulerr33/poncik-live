"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signOutAction } from "../_actions/auth-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type CurrentSessionPanelProps = Readonly<{
  destination: string;
  currentSession: {
    email: string;
    username: string;
  };
  publisherNotice:
    | {
        title: string;
        body: string;
      }
    | null;
}>;

export function CurrentSessionPanel({
  destination,
  currentSession,
  publisherNotice
}: CurrentSessionPanelProps) {
  const [signOutState, signOutFormAction, isSigningOut] = useActionState(
    signOutAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <>
      {publisherNotice ? (
        <AuthNotice
          title={publisherNotice.title}
          body={publisherNotice.body}
          tone="info"
        />
      ) : null}
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
          {publisherNotice ? AUTH_COPY.returnDiscoveryLabel : AUTH_COPY.continueLabel}
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
  );
}
