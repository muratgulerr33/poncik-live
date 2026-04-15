import styles from "./auth.module.css";
import { AUTH_COPY } from "../_lib/auth-copy";

export function PublisherApprovedSurface() {
  return (
    <div className={styles.inlineStatus}>
      <p className={`t-caption ${styles.inlineStatusTitle}`}>
        {AUTH_COPY.publisherApprovedTitle}
      </p>
      <p className={`t-caption ${styles.inlineStatusBody}`}>
        {AUTH_COPY.publisherApprovedBody}
      </p>
    </div>
  );
}
