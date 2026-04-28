"use client";

import { useActionState, useEffect, useRef } from "react";

import { signInLiveWatchGuestAction } from "../_actions/live-watch-guest-auth-actions";
import { INITIAL_LIVE_WATCH_GUEST_AUTH_ACTION_STATE } from "../_lib/live-watch-guest-auth-action-state";
import styles from "./live-watch-guest-auth-drawer.module.css";

type LiveWatchGuestLoginFormProps = Readonly<{
  onSuccess: () => void;
}>;

export function LiveWatchGuestLoginForm({
  onSuccess
}: LiveWatchGuestLoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInLiveWatchGuestAction,
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
      <div className={styles.field} data-live-auth-field="identifier">
        <label className={styles.label} htmlFor="live_guest_identifier">
          E-posta veya kullanıcı adı
        </label>
        <input
          autoComplete="username"
          className={styles.input}
          id="live_guest_identifier"
          name="identifier"
          required
        />
      </div>

      <div className={styles.field} data-live-auth-field="password">
        <label className={styles.label} htmlFor="live_guest_password">
          Şifre
        </label>
        <input
          autoComplete="current-password"
          className={styles.input}
          id="live_guest_password"
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
          {isPending ? "Giriş yapılıyor" : "Giriş yap"}
        </button>
      </div>
    </form>
  );
}
