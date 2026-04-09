import { StudioPermissionNotice } from "./StudioPermissionNotice";
import styles from "./studio.module.css";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioPrepSurfaceProps = {
  session: {
    accountId: string;
    username: string;
    email: string;
  };
};

export function StudioPrepSurface({ session }: StudioPrepSurfaceProps) {
  return (
    <section className={styles.card}>
      <div className={styles.prepStack}>
        <div>
          <h2 className={styles.panelTitle}>{STUDIO_COPY.prepTitle}</h2>
          <p className={styles.panelDescription}>{STUDIO_COPY.prepBody}</p>
        </div>

        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>{STUDIO_COPY.previewLabel}</p>
          <h3 className={styles.previewTitle}>{session.username}</h3>
          <p className={styles.previewBody}>{STUDIO_COPY.previewBody}</p>
        </div>

        <StudioPermissionNotice />

        <p className={styles.meta}>
          {STUDIO_COPY.prepMetaPrefix} {session.email}
        </p>
      </div>
    </section>
  );
}
