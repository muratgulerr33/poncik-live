import { type AuthSettingsNoticeView } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { PasswordChangeForm } from "./PasswordChangeForm";
import { UsernameChangeForm } from "./UsernameChangeForm";
import styles from "./auth-settings.module.css";

type AuthSettingsSurfaceProps = Readonly<{
  currentSession: {
    email: string;
    username: string;
    roleType: string;
    accountStatus: string;
  };
  settingsNotice: AuthSettingsNoticeView;
}>;

export function AuthSettingsSurface({
  currentSession,
  settingsNotice
}: AuthSettingsSurfaceProps) {
  return (
    <div className={styles.surface}>
      <UsernameChangeForm
        currentUsername={currentSession.username}
        settingsNotice={settingsNotice}
      />
      <PasswordChangeForm settingsNotice={settingsNotice} />
      <div className={styles.emailBlock}>
        <p className={`t-label ${styles.emailLabel}`}>{AUTH_COPY.settingsEmailLabel}</p>
        <p className={`t-body ${styles.emailValue}`}>{currentSession.email}</p>
      </div>
    </div>
  );
}
