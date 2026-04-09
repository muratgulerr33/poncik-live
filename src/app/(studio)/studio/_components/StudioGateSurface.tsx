import Link from "next/link";

import { type StudioPrepView } from "../_controllers/studio-prep-view";
import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio.module.css";

type StudioGateSurfaceProps = {
  view: Exclude<StudioPrepView, { kind: "redirect_auth" | "approved_prep" }>;
};

function getGateCopy(view: StudioGateSurfaceProps["view"]) {
  if (view.kind === "session_degraded_gate") {
    return {
      title: STUDIO_COPY.sessionDegradedTitle,
      body: STUDIO_COPY.sessionDegradedBody
    };
  }

  if (view.kind === "wrong_role") {
    return {
      title: STUDIO_COPY.wrongRoleTitle,
      body:
        view.roleType === "admin"
          ? STUDIO_COPY.wrongRoleAdminBody
          : STUDIO_COPY.wrongRoleUserBody
    };
  }

  if (view.gateKind === "pending_review") {
    return {
      title: STUDIO_COPY.pendingTitle,
      body: STUDIO_COPY.pendingBody
    };
  }

  if (view.gateKind === "rejected") {
    return {
      title: STUDIO_COPY.rejectedTitle,
      body: STUDIO_COPY.rejectedBody
    };
  }

  return {
    title: STUDIO_COPY.fallbackTitle,
    body: STUDIO_COPY.fallbackBody
  };
}

export function StudioGateSurface({ view }: StudioGateSurfaceProps) {
  const copy = getGateCopy(view);

  return (
    <section className={styles.card}>
      <h2 className={styles.panelTitle}>{copy.title}</h2>
      <p className={styles.panelDescription}>{copy.body}</p>

      <div className={styles.actionRow}>
        <Link className={styles.secondaryAction} href="/">
          {STUDIO_COPY.returnDiscoveryLabel}
        </Link>
      </div>
    </section>
  );
}
