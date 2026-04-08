import type { ReactNode } from "react";

import styles from "./discovery.module.css";

type DiscoveryShellProps = Readonly<{
  children: ReactNode;
}>;

export function DiscoveryShell({ children }: DiscoveryShellProps) {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={`t-label ${styles.eyebrow}`}>Public discovery</p>
        <h1 className="t-display">Su anda yayinda olan yayinlari kesfet.</h1>
        <p className={`t-body ${styles.description}`}>
          Tek aksiyonla yayin izleme yuzeyine gec. Ayrı profil adimi yok;
          izlemek icin dogrudan yayina gir.
        </p>
      </header>
      <section className={styles.section}>{children}</section>
    </main>
  );
}
