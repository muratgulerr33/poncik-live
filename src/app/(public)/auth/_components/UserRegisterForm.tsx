"use client";

import { useActionState } from "react";

import { registerUserAction } from "../_actions/auth-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type UserRegisterFormProps = Readonly<{
  next: string;
}>;

export function UserRegisterForm({ next }: UserRegisterFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerUserAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.field}>
        <label htmlFor="register_email" className="t-label">
          {AUTH_COPY.emailLabel}
        </label>
        <input
          id="register_email"
          name="email"
          type="email"
          className={styles.input}
          autoComplete="email"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="register_username" className="t-label">
          {AUTH_COPY.usernameLabel}
        </label>
        <input
          id="register_username"
          name="username"
          className={styles.input}
          autoComplete="username"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="register_password" className="t-label">
          {AUTH_COPY.passwordLabel}
        </label>
        <input
          id="register_password"
          name="password"
          type="password"
          className={styles.input}
          autoComplete="new-password"
          required
        />
      </div>
      {state.status === "error" && state.message ? (
        <AuthNotice title="Kayıt açılamadı" body={state.message} tone="error" />
      ) : null}
      <div className={styles.actionRow}>
        <button
          type="submit"
          className="ui-action ui-action-primary"
          disabled={isPending}
        >
          {isPending ? "Hesap oluşturuluyor" : AUTH_COPY.userRegisterLabel}
        </button>
      </div>
    </form>
  );
}
