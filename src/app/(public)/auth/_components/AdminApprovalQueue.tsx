import { type AdminApprovalStatusFilter } from "../_controllers/auth-surface-view";

import { AdminApprovalRow } from "./AdminApprovalRow";
import styles from "./auth.module.css";

type AdminApprovalQueueProps = Readonly<{
  isReadOnly: boolean;
  items: {
    id: string;
    accountId: string;
    fullName: string;
    phone: string;
    email: string;
    username: string;
    status: "pending_review" | "approved" | "rejected";
    createdAtLabel: string;
  }[];
  selectedFilter: AdminApprovalStatusFilter;
}>;

export function AdminApprovalQueue({
  isReadOnly,
  items,
  selectedFilter
}: AdminApprovalQueueProps) {
  return (
    <div className={styles.statusStack}>
      {items.map((item) => (
        <AdminApprovalRow
          key={item.id}
          isReadOnly={isReadOnly}
          item={item}
          selectedFilter={selectedFilter}
        />
      ))}
    </div>
  );
}
