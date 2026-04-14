import styles from "./live-watch.module.css";

type LiveWatchMessageProps = Readonly<{
  username: string;
}>;

export function LiveWatchLoadingState() {
  return (
    <div className={styles.stateCard}>
      <div className={styles.loadingPresence} aria-hidden="true">
        <span className={styles.loadingSpinner} />
      </div>
      <h2 className="t-h3">Yayın yükleniyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Canlı yayına bağlanıyor.
      </p>
    </div>
  );
}

export function LiveEndedState({ username }: LiveWatchMessageProps) {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayın sona erdi</h2>
      <p className={`t-body ${styles.stateBody}`}>
        @{username} için en son yayın artık açık değil. Discovery yüzeyine dönüp
        başka bir yayın izleyebilirsin.
      </p>
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
