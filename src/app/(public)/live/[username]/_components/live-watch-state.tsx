import styles from "./live-watch.module.css";

type LiveWatchMessageProps = Readonly<{
  username: string;
}>;

export function LiveWatchLoadingState() {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayin yukleniyor</h2>
      <p className={`t-body ${styles.stateBody}`}>
        Public watch yuzeyi hazirlaniyor.
      </p>
    </div>
  );
}

export function LiveWatchFrame({ username }: LiveWatchMessageProps) {
  return (
    <section className={styles.frame} aria-label={`@${username} canli yayin cercevesi`}>
      <div className={styles.frameInner}>
        <h2 className="t-h2">Canli yayin</h2>
        <p className={`t-body ${styles.frameBody}`}>
          @{username} su anda yayinda. Bu yuzey yalniz public watch frame ve durum
          bilgisini tasir.
        </p>
      </div>
    </section>
  );
}

export function LiveEndedState({ username }: LiveWatchMessageProps) {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayin sona erdi</h2>
      <p className={`t-body ${styles.stateBody}`}>
        @{username} icin en son yayin artik acik degil. Discovery yuzeyine donup
        baska bir yayin izleyebilirsin.
      </p>
    </div>
  );
}

export function LiveUnavailableState({ username }: LiveWatchMessageProps) {
  return (
    <div className={styles.stateCard}>
      <h2 className="t-h3">Yayin su anda kullanilabilir degil</h2>
      <p className={`t-body ${styles.stateBody}`}>
        @{username} icin izlenebilir bir yayin bulunamadi.
      </p>
    </div>
  );
}
