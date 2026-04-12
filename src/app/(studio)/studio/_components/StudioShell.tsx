import { StudioGateSurface } from "./StudioGateSurface";
import { StudioFreshness } from "./StudioFreshness";
import { StudioPrepSurface } from "./StudioPrepSurface";
import styles from "./studio.module.css";
import { type StudioPrepView } from "../_controllers/studio-prep-view";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioShellProps = {
  view: Exclude<StudioPrepView, { kind: "redirect_auth" }>;
};

export function StudioShell({ view }: StudioShellProps) {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{STUDIO_COPY.eyebrow}</p>
          <h1 className={styles.title}>{STUDIO_COPY.title}</h1>
          <p className={styles.description}>{STUDIO_COPY.description}</p>
        </header>

        {view.kind === "approved_prep" ? (
          <StudioPrepSurface lifecycle={view.lifecycle} session={view.session} />
        ) : (
          <>
            <StudioFreshness />
            <StudioGateSurface view={view} />
          </>
        )}
      </section>
    </main>
  );
}
