"use client";

import { useActionState } from "react";

import { registerPublisherAction } from "../_actions/auth-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

export function PublisherRegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerPublisherAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="publisher_full_name" className="t-label">
          {AUTH_COPY.fullNameLabel}
        </label>
        <input
          id="publisher_full_name"
          name="full_name"
          className={styles.input}
          autoComplete="name"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="publisher_username" className="t-label">
          {AUTH_COPY.usernameLabel}
        </label>
        <input
          id="publisher_username"
          name="username"
          className={styles.input}
          autoComplete="username"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="publisher_phone" className="t-label">
          {AUTH_COPY.phoneLabel}
        </label>
        <input
          id="publisher_phone"
          name="phone"
          type="tel"
          className={styles.input}
          autoComplete="tel"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="publisher_email" className="t-label">
          {AUTH_COPY.emailLabel}
        </label>
        <input
          id="publisher_email"
          name="email"
          type="email"
          className={styles.input}
          autoComplete="email"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="publisher_password" className="t-label">
          {AUTH_COPY.passwordLabel}
        </label>
        <input
          id="publisher_password"
          name="password"
          type="password"
          className={styles.input}
          autoComplete="new-password"
          required
        />
      </div>
      {state.status === "error" && state.message ? (
        <AuthNotice title="Başvuru tamamlanamadı" body={state.message} tone="error" />
      ) : null}
      <div className={styles.actionRow}>
        <button
          type="submit"
          className={`${styles.action} ${isPending ? styles.actionDisabled : ""}`}
          disabled={isPending}
        >
          {isPending
            ? "Başvuru gönderiliyor"
            : AUTH_COPY.publisherRegisterLabel}
        </button>
      </div>
    </form>
  );
}
