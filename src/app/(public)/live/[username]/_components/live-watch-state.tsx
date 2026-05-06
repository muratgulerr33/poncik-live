import styles from "./live-watch.module.css";

type LiveWatchMessageProps = Readonly<{
  username: string;
}>;

export function LiveWatchLoadingState() {
  return (
    <section
      aria-hidden="true"
      className={`${styles.frame} ${styles.loadingScaffold}`}
    >
      <div className={styles.mediaStage} />
    </section>
  );
}

export function LiveEndedState() {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayın sona erdi</h2>
      <p className={`t-body ${styles.stateBody}`}>Ana sayfaya dönüyorsun…</p>
    </div>
  );
}

export function LiveUnavailableState({ username }: LiveWatchMessageProps) {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayın şu anda kullanılabilir değil</h2>
      <p className={`t-body ${styles.stateBody}`}>
        @{username} için izlenebilir bir yayın bulunamadı.
      </p>
    </div>
  );
}
