import { StudioGateSurface } from "./StudioGateSurface";
import { StudioFreshness } from "./StudioFreshness";
import { StudioPrepSurface } from "./StudioPrepSurface";
import { StudioRouteShell } from "./studio-route-shell";
import styles from "./studio.module.css";
import { type StudioPrepView } from "../_controllers/studio-prep-view";

type StudioShellProps = {
  view: Exclude<StudioPrepView, { kind: "redirect_auth" }>;
};

export function StudioShell({ view }: StudioShellProps) {
  const isApprovedPrep = view.kind === "approved_prep";
  const pageClassName = isApprovedPrep
    ? `${styles.page} ${styles.pageScene}`
    : styles.page;

  return (
    <main className={pageClassName}>
      <StudioFreshness />
      <div className={isApprovedPrep ? styles.sceneApproved : styles.sceneGate}>
        {isApprovedPrep ? (
          <StudioPrepSurface
            lifecycle={view.lifecycle}
            username={view.session.username}
          />
        ) : (
          <StudioRouteShell>
            <StudioGateSurface view={view} />
          </StudioRouteShell>
        )}
      </div>
    </main>
  );
}
