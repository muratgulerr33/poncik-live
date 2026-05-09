"use client";

import { useActionState } from "react";

import { updateUsernameAction } from "../_actions/settings-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import styles from "./auth-settings.module.css";

type UsernameChangeFormProps = Readonly<{
  currentUsername: string;
  settingsNotice: {
    target: "username" | "password";
    message: string;
  } | null;
}>;

export function UsernameChangeForm({
  currentUsername,
  settingsNotice
}: UsernameChangeFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateUsernameAction,
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <form action={formAction} className={styles.form}>
      <p className={`t-label ${styles.sectionLabel}`}>{AUTH_COPY.usernameLabel}</p>

      <div className={styles.field}>
        <label htmlFor="settings_username" className={`t-label ${styles.fieldLabel}`}>
          {AUTH_COPY.settingsUsernameInputLabel}
        </label>
        <input
          id="settings_username"
          name="username"
          className={styles.input}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          minLength={3}
          maxLength={24}
          defaultValue={currentUsername}
          required
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className={`t-caption ${styles.formMessage} ${styles.formError}`}>
          {state.message}
        </p>
      ) : null}

      {state.status !== "error" &&
      settingsNotice?.target === "username" ? (
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
          {AUTH_COPY.settingsUsernameSubmitLabel}
        </button>
      </div>
    </form>
  );
}
