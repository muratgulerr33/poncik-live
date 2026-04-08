import styles from "./auth.module.css";

type AuthNoticeProps = Readonly<{
  title: string;
  body: string;
  tone: "info" | "error";
  meta?: string;
}>;

export function AuthNotice({ title, body, tone, meta }: AuthNoticeProps) {
  const toneClass =
    tone === "error" ? styles.noticeError : styles.noticeInfo;

  return (
    <div className={`${styles.notice} ${toneClass}`}>
      <p className={`t-label ${styles.noticeTitle}`}>{title}</p>
      <p className={`t-body ${styles.noticeBody}`}>{body}</p>
      {meta ? <p className={`t-caption ${styles.meta}`}>{meta}</p> : null}
    </div>
  );
}
