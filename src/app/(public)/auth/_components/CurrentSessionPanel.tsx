"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signOutAction } from "../_actions/auth-actions";
import { type AdminSurfaceView } from "../_controllers/auth-surface-view";
import { type PublisherSurfaceView } from "../_controllers/auth-surface-view";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AdminApprovalPanel } from "./AdminApprovalPanel";
import { AuthFreshness } from "./AuthFreshness";
import { AuthNotice } from "./AuthNotice";
import { PublisherStatusPanel } from "./PublisherStatusPanel";
import styles from "./auth.module.css";

type CurrentSessionPanelProps = Readonly<{
  primaryActionHref: string;
  primaryActionLabel: string;
  adminSurface: AdminSurfaceView;
  currentSession: {
    email: string;
    username: string;
  };
  publisherSurface: PublisherSurfaceView;
}>;

export function CurrentSessionPanel({
  primaryActionHref,
  primaryActionLabel,
  adminSurface,
  currentSession,
  publisherSurface
}: CurrentSessionPanelProps) {
  const [signOutState, signOutFormAction, isSigningOut] = useActionState(
    signOutAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <>
      <AuthFreshness />
      {adminSurface ? <AdminApprovalPanel adminSurface={adminSurface} /> : null}
      {publisherSurface ? (
        <PublisherStatusPanel publisherSurface={publisherSurface} />
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
        <Link href={primaryActionHref} className="ui-action ui-action-primary">
          {primaryActionLabel}
        </Link>
        <form action={signOutFormAction} className={styles.actionForm}>
          <button
            type="submit"
            className="ui-action ui-action-secondary"
            disabled={isSigningOut}
          >
            {AUTH_COPY.signOutLabel}
          </button>
        </form>
      </div>
    </>
  );
}
