import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";

export function AdminApprovalEmptyState() {
  return (
    <AuthNotice
      title={AUTH_COPY.adminApprovalEmptyTitle}
      body={AUTH_COPY.adminApprovalEmptyBody}
      tone="info"
    />
  );
}
