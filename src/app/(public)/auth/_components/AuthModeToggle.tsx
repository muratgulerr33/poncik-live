"use client";

import { AUTH_COPY } from "../_lib/auth-copy";

import styles from "./auth.module.css";

type AuthModeToggleProps = Readonly<{
  mode: "login" | "user-register" | "publisher-register";
  onChange: (
    nextMode: "login" | "user-register" | "publisher-register"
  ) => void;
}>;

export function AuthModeToggle({ mode, onChange }: AuthModeToggleProps) {
  return (
    <div className={styles.toggleRow} role="tablist" aria-label="Auth mode">
      <button
        type="button"
        className={`${styles.toggleButton} ${mode === "login" ? styles.toggleButtonActive : ""}`}
        onClick={() => onChange("login")}
      >
        {AUTH_COPY.loginToggle}
      </button>
      <button
        type="button"
        className={`${styles.toggleButton} ${
          mode === "user-register" ? styles.toggleButtonActive : ""
        }`}
        onClick={() => onChange("user-register")}
      >
        {AUTH_COPY.userRegisterToggle}
      </button>
      <button
        type="button"
        className={`${styles.toggleButton} ${
          mode === "publisher-register" ? styles.toggleButtonActive : ""
        }`}
        onClick={() => onChange("publisher-register")}
      >
        {AUTH_COPY.publisherRegisterToggle}
      </button>
    </div>
  );
}
