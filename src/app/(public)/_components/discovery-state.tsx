import styles from "./discovery.module.css";

export function DiscoveryLoadingState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Keşif yükleniyor</h2>
      <p className={`t-body ${styles.stateBody}`}>Yayınlar kontrol ediliyor.</p>
    </div>
  );
}

export function DiscoveryEmptyState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Şu anda canlı yayın yok</h2>
      <p className={`t-body ${styles.stateBody}`}>Yeni yayınlar burada görünür.</p>
    </div>
  );
}

export function DiscoveryErrorState() {
  return (
    <div className={styles.stateCard}>
      <h2 className={`t-h3 ${styles.stateTitle}`}>Keşif şu anda açılamıyor</h2>
      <p className={`t-body ${styles.stateBody}`}>Liste şu anda alınamadı.</p>
    </div>
  );
}
