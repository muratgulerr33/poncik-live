"use client";

import { AUTH_COPY } from "../_lib/auth-copy";

import styles from "./auth.module.css";

type AuthModeToggleProps = Readonly<{
  mode: "login" | "register";
  onChange: (nextMode: "login" | "register") => void;
}>;

export function AuthModeToggle({ mode, onChange }: AuthModeToggleProps) {
  return (
    <div className={styles.toggleRow} role="tablist" aria-label="Auth mode">
      <button
        type="button"
        className={`${styles.toggleButton} ${
          mode === "login" ? styles.toggleButtonActive : ""
        }`}
        onClick={() => onChange("login")}
      >
        {AUTH_COPY.loginToggle}
      </button>
      <button
        type="button"
        className={`${styles.toggleButton} ${
          mode === "register" ? styles.toggleButtonActive : ""
        }`}
        onClick={() => onChange("register")}
      >
        {AUTH_COPY.registerToggle}
      </button>
    </div>
  );
}
