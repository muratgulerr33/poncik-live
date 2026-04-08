import styles from "./discovery.module.css";

export function DiscoveryLoadingState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Discovery yukleniyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Yaydaki hesaplar kontrol ediliyor.
      </p>
    </div>
  );
}

export function DiscoveryEmptyState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Su anda yayinda kimse yok</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Yeni bir yayin acildiginda burada dogrudan izleme karti gorunur.
      </p>
    </div>
  );
}

export function DiscoveryErrorState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Discovery su anda acilamiyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Public discovery verisi su anda okunamadi.
      </p>
    </div>
  );
}
