import { StudioPreviewPanel } from "./StudioPreviewPanel";
import styles from "./studio.module.css";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioPrepSurfaceProps = {
  lifecycle: {
    kind: "idle" | "live" | "degraded";
    broadcastId?: string;
  };
};

export function StudioPrepSurface({ lifecycle }: StudioPrepSurfaceProps) {
  return (
    <section className={styles.prepScene}>
      <div className={styles.prepIntro}>
        <h2 className={styles.panelTitle}>{STUDIO_COPY.prepTitle}</h2>
        <p className={styles.panelDescription}>{STUDIO_COPY.prepBody}</p>
      </div>

      <StudioPreviewPanel lifecycle={lifecycle} />
    </section>
  );
}
