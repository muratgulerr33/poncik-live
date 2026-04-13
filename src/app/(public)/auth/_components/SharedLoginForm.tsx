"use client";

import { useActionState } from "react";

import { signInAction } from "../_actions/auth-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type SharedLoginFormProps = Readonly<{
  next: string;
}>;

export function SharedLoginForm({ next }: SharedLoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.field}>
        <label htmlFor="auth_identifier" className="t-label">
          {AUTH_COPY.identifierLabel}
        </label>
        <input
          id="auth_identifier"
          name="identifier"
          className={styles.input}
          autoComplete="username"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="auth_password" className="t-label">
          {AUTH_COPY.passwordLabel}
        </label>
        <input
          id="auth_password"
          name="password"
          type="password"
          className={styles.input}
          autoComplete="current-password"
          required
        />
      </div>
      {state.status === "error" && state.message ? (
        <AuthNotice title="Giriş açılamadı" body={state.message} tone="error" />
      ) : null}
      <div className={styles.actionRow}>
        <button
          type="submit"
          className="ui-action ui-action-primary"
          disabled={isPending}
        >
          {isPending ? "Giriş kontrol ediliyor" : AUTH_COPY.signInLabel}
        </button>
      </div>
    </form>
  );
}
