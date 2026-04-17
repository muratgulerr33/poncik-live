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
            <p className={`t-label ${styles.eyebrow}`}>Keşfet</p>
            <h1 className="t-display">Şu anda yayında olanlar</h1>
            <p className={`t-body ${styles.description}`}>Aktif olan yayınları izle.</p>
          </header>
          <section className={styles.section}>{children}</section>
        </div>
      </div>
    </main>
  );
}
