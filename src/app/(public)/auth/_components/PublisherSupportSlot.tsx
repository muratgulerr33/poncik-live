import styles from "./auth.module.css";

type PublisherSupportSlotProps = Readonly<{
  title: string;
  body: string;
  tone: "primary" | "secondary";
}>;

export function PublisherSupportSlot({
  title,
  body,
  tone
}: PublisherSupportSlotProps) {
  return (
    <div
      className={`${styles.supportSlot} ${
        tone === "primary" ? styles.supportSlotPrimary : styles.supportSlotSecondary
      }`}
    >
      <p className={`t-label ${styles.supportTitle}`}>{title}</p>
      <p className={`t-caption ${styles.supportBody}`}>{body}</p>
    </div>
  );
}
