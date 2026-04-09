import { type PublisherSurfaceView } from "../_controllers/auth-surface-view";

import { PublisherApprovedSurface } from "./PublisherApprovedSurface";
import { PublisherPendingSurface } from "./PublisherPendingSurface";
import { PublisherRejectedSurface } from "./PublisherRejectedSurface";
import { PublisherStatusFallback } from "./PublisherStatusFallback";
import styles from "./auth.module.css";

type PublisherStatusPanelProps = Readonly<{
  publisherSurface: Exclude<PublisherSurfaceView, null>;
}>;

export function PublisherStatusPanel({
  publisherSurface
}: PublisherStatusPanelProps) {
  return (
    <div className={styles.statusStack}>
      {publisherSurface.kind === "pending_review" ? (
        <PublisherPendingSurface
          showContinuityHint={publisherSurface.showContinuityHint}
        />
      ) : null}
      {publisherSurface.kind === "approved" ? <PublisherApprovedSurface /> : null}
      {publisherSurface.kind === "rejected" ? <PublisherRejectedSurface /> : null}
      {publisherSurface.kind === "missing" || publisherSurface.kind === "degraded" ? (
        <PublisherStatusFallback
          kind={publisherSurface.kind}
          showContinuityHint={publisherSurface.showContinuityHint}
        />
      ) : null}
    </div>
  );
}
