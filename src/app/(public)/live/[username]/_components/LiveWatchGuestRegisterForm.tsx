"use client";

import { useActionState, useEffect, useRef } from "react";

import { registerLiveWatchGuestUserAction } from "../_actions/live-watch-guest-auth-actions";
import { INITIAL_LIVE_WATCH_GUEST_AUTH_ACTION_STATE } from "../_lib/live-watch-guest-auth-action-state";
import styles from "./live-watch-guest-auth-drawer.module.css";

type LiveWatchGuestRegisterFormProps = Readonly<{
  onSuccess: () => void;
}>;

export function LiveWatchGuestRegisterForm({
  onSuccess
}: LiveWatchGuestRegisterFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerLiveWatchGuestUserAction,
    INITIAL_LIVE_WATCH_GUEST_AUTH_ACTION_STATE
  );
  const hasReportedSuccessRef = useRef(false);

  useEffect(() => {
    if (state.status !== "success") {
      hasReportedSuccessRef.current = false;
      return;
    }

    if (hasReportedSuccessRef.current) {
      return;
    }

    hasReportedSuccessRef.current = true;
    onSuccess();
  }, [onSuccess, state.status]);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field} data-live-auth-field="email">
        <label className={styles.label} htmlFor="live_guest_register_email">
          E-posta
        </label>
        <input
          autoComplete="email"
          className={styles.input}
          id="live_guest_register_email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className={styles.field} data-live-auth-field="username">
        <label className={styles.label} htmlFor="live_guest_register_username">
          Kullanıcı adı
        </label>
        <input
          autoComplete="username"
          className={styles.input}
          id="live_guest_register_username"
          name="username"
          required
        />
      </div>

      <div className={styles.field} data-live-auth-field="password">
        <label className={styles.label} htmlFor="live_guest_register_password">
          Şifre
        </label>
        <input
          autoComplete="new-password"
          className={styles.input}
          id="live_guest_register_password"
          name="password"
          required
          type="password"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className={styles.inlineError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.actionRow}>
        <button
          className={styles.submitButton}
          data-live-auth-submit="true"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Kayıt açılıyor" : "Kayıt ol"}
        </button>
      </div>
    </form>
  );
}
