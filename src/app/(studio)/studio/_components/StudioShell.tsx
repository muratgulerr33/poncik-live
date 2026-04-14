import { StudioGateSurface } from "./StudioGateSurface";
import { StudioFreshness } from "./StudioFreshness";
import { StudioPrepSurface } from "./StudioPrepSurface";
import { StudioRouteShell } from "./studio-route-shell";
import styles from "./studio.module.css";
import { type StudioPrepView } from "../_controllers/studio-prep-view";
import { STUDIO_COPY } from "../_lib/studio-copy";

type StudioShellProps = {
  view: Exclude<StudioPrepView, { kind: "redirect_auth" }>;
};

function getLifecycleLabel(
  kind: Extract<StudioPrepView, { kind: "approved_prep" }>["lifecycle"]["kind"]
) {
  if (kind === "live") {
    return STUDIO_COPY.liveLifecycleLabel;
  }

  if (kind === "degraded") {
    return STUDIO_COPY.degradedLifecycleLabel;
  }

  return STUDIO_COPY.idleLifecycleLabel;
}

export function StudioShell({ view }: StudioShellProps) {
  const isApprovedPrep = view.kind === "approved_prep";

  return (
    <main className={styles.page}>
      <StudioFreshness />
      <div className={isApprovedPrep ? styles.sceneApproved : styles.sceneGate}>
        {isApprovedPrep ? (
          <StudioPrepSurface
            lifecycle={view.lifecycle}
            statusLabel={getLifecycleLabel(view.lifecycle.kind)}
            statusTone={view.lifecycle.kind}
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
