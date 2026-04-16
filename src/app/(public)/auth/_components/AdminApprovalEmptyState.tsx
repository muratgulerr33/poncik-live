import { type AdminApprovalStatusFilter } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";

type AdminApprovalEmptyStateProps = Readonly<{
  selectedFilter: AdminApprovalStatusFilter;
}>;

function getEmptyCopy(selectedFilter: AdminApprovalStatusFilter) {
  if (selectedFilter === "approved") {
    return {
      title: AUTH_COPY.adminApprovalApprovedEmptyTitle,
      body: AUTH_COPY.adminApprovalApprovedEmptyBody
    };
  }

  if (selectedFilter === "rejected") {
    return {
      title: AUTH_COPY.adminApprovalRejectedEmptyTitle,
      body: AUTH_COPY.adminApprovalRejectedEmptyBody
    };
  }

  if (selectedFilter === "all") {
    return {
      title: AUTH_COPY.adminApprovalAllEmptyTitle,
      body: AUTH_COPY.adminApprovalAllEmptyBody
    };
  }

  return {
    title: AUTH_COPY.adminApprovalEmptyTitle,
    body: AUTH_COPY.adminApprovalEmptyBody
  };
}

export function AdminApprovalEmptyState({
  selectedFilter
}: AdminApprovalEmptyStateProps) {
  const copy = getEmptyCopy(selectedFilter);

  return (
    <AuthNotice
      title={copy.title}
      body={copy.body}
      tone="info"
    />
  );
}
