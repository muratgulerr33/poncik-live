import type { ReactNode } from "react";

import styles from "./discovery.module.css";

type DiscoveryShellProps = Readonly<{
  chrome?: ReactNode;
  children: ReactNode;
}>;

export function DiscoveryShell({ chrome, children }: DiscoveryShellProps) {
  return (
    <main className={styles.page}>
      {chrome ? <div className={styles.chromeSlot}>{chrome}</div> : null}

      <div className={styles.shellLayout}>
        <div className={styles.contentColumn}>
          <header className={styles.hero}>
            <p className={`t-label ${styles.eyebrow}`}>Public discovery</p>
            <h1 className="t-display">Şu anda yayında olan yayınları keşfet.</h1>
            <p className={`t-body ${styles.description}`}>
              Tek aksiyonla yayın izleme yüzeyine geç. Ayrı profil adımı yok;
              izlemek için doğrudan yayına gir.
            </p>
          </header>
          <section className={styles.section}>{children}</section>
        </div>
      </div>
    </main>
  );
}
