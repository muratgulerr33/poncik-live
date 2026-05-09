import Link from "next/link";

import { AUTH_COPY } from "../_lib/auth-copy";

import styles from "./auth-settings.module.css";

type AuthSettingsSurfaceProps = Readonly<{
  currentSession: {
    email: string;
    username: string;
    roleType: string;
    accountStatus: string;
  };
}>;

function getRoleLabel(roleType: string) {
  if (roleType === "publisher") {
    return AUTH_COPY.settingsRolePublisherLabel;
  }

  if (roleType === "admin") {
    return AUTH_COPY.settingsRoleAdminLabel;
  }

  return AUTH_COPY.settingsRoleUserLabel;
}

function getAccountStatusLabel(accountStatus: string) {
  if (accountStatus === "active") {
    return AUTH_COPY.settingsAccountStatusActiveLabel;
  }

  return accountStatus;
}

export function AuthSettingsSurface({
  currentSession
}: AuthSettingsSurfaceProps) {
  return (
    <div className={styles.surface}>
      <div className={styles.header}>
        <p className={`t-label ${styles.eyebrow}`}>{AUTH_COPY.settingsEyebrow}</p>
        <h2 className={`t-h2 ${styles.title}`}>{AUTH_COPY.settingsTitle}</h2>
        <p className={`t-body ${styles.description}`}>
          {AUTH_COPY.settingsDescription}
        </p>
      </div>

      <div className={styles.notice}>
        <p className={`t-body ${styles.noticeBody}`}>
          {AUTH_COPY.settingsReadonlyBody}
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.row}>
          <span className={`t-caption ${styles.label}`}>
            {AUTH_COPY.settingsUsernameLabel}
          </span>
          <span className={`t-body ${styles.value}`}>@{currentSession.username}</span>
        </div>
        <div className={styles.row}>
          <span className={`t-caption ${styles.label}`}>
            {AUTH_COPY.settingsEmailLabel}
          </span>
          <span className={`t-body ${styles.value}`}>{currentSession.email}</span>
        </div>
        <div className={styles.row}>
          <span className={`t-caption ${styles.label}`}>
            {AUTH_COPY.settingsRoleLabel}
          </span>
          <span className={`t-body ${styles.value}`}>
            {getRoleLabel(currentSession.roleType)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={`t-caption ${styles.label}`}>
            {AUTH_COPY.settingsAccountStatusLabel}
          </span>
          <span className={`t-body ${styles.value}`}>
            {getAccountStatusLabel(currentSession.accountStatus)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <Link href="/auth" className={styles.backLink}>
          {AUTH_COPY.settingsBackLabel}
        </Link>
      </div>
    </div>
  );
}
