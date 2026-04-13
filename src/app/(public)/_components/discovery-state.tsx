import styles from "./discovery.module.css";

export function DiscoveryLoadingState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Discovery yükleniyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Yaydaki hesaplar kontrol ediliyor.
      </p>
    </div>
  );
}

export function DiscoveryEmptyState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Şu anda yayında kimse yok</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Yeni bir yayın açıldığında burada doğrudan izleme kartı görünür.
      </p>
    </div>
  );
}

export function DiscoveryErrorState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Discovery şu anda açılamıyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Public discovery verisi şu anda okunamadı.
      </p>
    </div>
  );
}
