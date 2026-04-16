import Link from "next/link";

import { type AdminSurfaceView } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AdminApprovalEmptyState } from "./AdminApprovalEmptyState";
import { AdminApprovalQueue } from "./AdminApprovalQueue";
import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type AdminApprovalPanelProps = Readonly<{
  adminSurface: Exclude<AdminSurfaceView, null>;
}>;

export function AdminApprovalPanel({ adminSurface }: AdminApprovalPanelProps) {
  const selectedFilter = adminSurface.selectedFilter;

  return (
    <>
      <AuthNotice
        title={AUTH_COPY.adminApprovalTitle}
        body={AUTH_COPY.adminApprovalBody}
        tone="info"
      />
      <div className={styles.adminFilterRow}>
        {(
          [
            ["pending_review", AUTH_COPY.adminFilterPendingLabel],
            ["approved", AUTH_COPY.adminFilterApprovedLabel],
            ["rejected", AUTH_COPY.adminFilterRejectedLabel],
            ["all", AUTH_COPY.adminFilterAllLabel]
          ] as const
        ).map(([filter, label]) => (
          <Link
            key={filter}
            href={filter === "pending_review" ? "/auth" : `/auth?status=${filter}`}
            className={`${styles.adminFilterTab} ${
              selectedFilter === filter ? styles.adminFilterTabActive : ""
            }`.trim()}
          >
            {label}
          </Link>
        ))}
      </div>
      {adminSurface.kind === "queue" ? (
        <AdminApprovalQueue
          isReadOnly={adminSurface.isReadOnly}
          items={adminSurface.items}
          selectedFilter={adminSurface.selectedFilter}
        />
      ) : null}
      {adminSurface.kind === "empty" ? (
        <AdminApprovalEmptyState selectedFilter={adminSurface.selectedFilter} />
      ) : null}
      {adminSurface.kind === "degraded" ? (
        <AuthNotice
          title={AUTH_COPY.adminApprovalDegradedTitle}
          body={AUTH_COPY.adminApprovalDegradedBody}
          tone="info"
        />
      ) : null}
    </>
  );
}
