import { StudioPreviewPanel } from "./StudioPreviewPanel";
import styles from "./studio.module.css";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioPrepSurfaceProps = {
  session: {
    accountId: string;
    username: string;
    email: string;
  };
  lifecycle: {
    kind: "idle" | "live" | "degraded";
    broadcastId?: string;
  };
};

export function StudioPrepSurface({ session, lifecycle }: StudioPrepSurfaceProps) {
  return (
    <section className={styles.card}>
      <div className={styles.prepStack}>
        <div>
          <h2 className={styles.panelTitle}>{STUDIO_COPY.prepTitle}</h2>
          <p className={styles.panelDescription}>{STUDIO_COPY.prepBody}</p>
        </div>

        <StudioPreviewPanel lifecycle={lifecycle} username={session.username} />

        <p className={styles.meta}>
          {STUDIO_COPY.prepMetaPrefix} {session.email}
        </p>
      </div>
    </section>
  );
}
