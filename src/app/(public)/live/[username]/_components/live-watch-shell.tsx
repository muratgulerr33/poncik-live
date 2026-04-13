import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./live-watch.module.css";

type LiveWatchShellProps = Readonly<{
  username: string;
  children: ReactNode;
}>;

export function LiveWatchShell({ username, children }: LiveWatchShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={`t-label ${styles.backLink}`}>
          {"<"} Discovery sayfasına dön
        </Link>
        <header className={styles.header}>
          <p className={`t-label ${styles.eyebrow}`}>Public watch</p>
          <h1 className="t-h1">@{username}</h1>
          <p className={`t-body ${styles.description}`}>
            Bu yüzey yalnız izleme ve geri dönüş davranışını taşır. Auth
            gerektirmez.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
