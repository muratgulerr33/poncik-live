"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "../_actions/password-settings-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import styles from "./auth-settings.module.css";

type PasswordChangeFormProps = Readonly<{
  settingsNotice: {
    target: "username" | "password";
    message: string;
  } | null;
}>;

export function PasswordChangeForm({
  settingsNotice
}: PasswordChangeFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label
          htmlFor="settings_current_password"
          className={`t-label ${styles.fieldLabel}`}
        >
          {AUTH_COPY.settingsPasswordCurrentInputLabel}
        </label>
        <input
          id="settings_current_password"
          name="current_password"
          type="password"
          className={styles.input}
          autoComplete="current-password"
          required
        />
      </div>

      <div className={styles.field}>
        <label
          htmlFor="settings_new_password"
          className={`t-label ${styles.fieldLabel}`}
        >
          {AUTH_COPY.settingsPasswordNewInputLabel}
        </label>
        <input
          id="settings_new_password"
          name="new_password"
          type="password"
          className={styles.input}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>

      <div className={styles.field}>
        <label
          htmlFor="settings_confirm_password"
          className={`t-label ${styles.fieldLabel}`}
        >
          {AUTH_COPY.settingsPasswordConfirmInputLabel}
        </label>
        <input
          id="settings_confirm_password"
          name="confirm_password"
          type="password"
          className={styles.input}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          aria-label="Yeni şifre tekrarı"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className={`t-caption ${styles.formMessage} ${styles.formError}`}>
          {state.message}
        </p>
      ) : null}

      {state.status !== "error" &&
      settingsNotice?.target === "password" ? (
        <p className={`t-caption ${styles.formMessage} ${styles.formSuccess}`}>
          {settingsNotice.message}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button
          type="submit"
          className="ui-action ui-action-primary"
          disabled={isPending}
        >
          {AUTH_COPY.settingsPasswordSubmitLabel}
        </button>
      </div>
    </form>
  );
}
