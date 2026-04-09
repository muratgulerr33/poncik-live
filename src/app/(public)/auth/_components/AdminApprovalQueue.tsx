import { AdminApprovalRow } from "./AdminApprovalRow";
import styles from "./auth.module.css";

type AdminApprovalQueueProps = Readonly<{
  items: {
    id: string;
    accountId: string;
    fullName: string;
    phone: string;
    email: string;
    username: string;
    createdAtLabel: string;
  }[];
}>;

export function AdminApprovalQueue({ items }: AdminApprovalQueueProps) {
  return (
    <div className={styles.statusStack}>
      {items.map((item) => (
        <AdminApprovalRow key={item.id} item={item} />
      ))}
    </div>
  );
}
