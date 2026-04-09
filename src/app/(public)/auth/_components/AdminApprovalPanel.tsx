import { type AdminSurfaceView } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AdminApprovalEmptyState } from "./AdminApprovalEmptyState";
import { AdminApprovalQueue } from "./AdminApprovalQueue";
import { AuthNotice } from "./AuthNotice";

type AdminApprovalPanelProps = Readonly<{
  adminSurface: Exclude<AdminSurfaceView, null>;
}>;

export function AdminApprovalPanel({ adminSurface }: AdminApprovalPanelProps) {
  return (
    <>
      <AuthNotice
        title={AUTH_COPY.adminApprovalTitle}
        body={AUTH_COPY.adminApprovalBody}
        tone="info"
      />
      {adminSurface.kind === "queue" ? (
        <AdminApprovalQueue items={adminSurface.items} />
      ) : null}
      {adminSurface.kind === "empty" ? <AdminApprovalEmptyState /> : null}
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
