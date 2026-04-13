import Link from "next/link";

import type { DiscoveryEntry } from "../_lib/public-live-read";

import styles from "./discovery.module.css";

type DiscoveryCardProps = Readonly<{
  entry: DiscoveryEntry;
}>;

export function DiscoveryCard({ entry }: DiscoveryCardProps) {
  return (
    <Link
      href={entry.href}
      className={styles.cardLink}
      aria-label={`@${entry.username} canli yayinini izle`}
    >
      <article className={styles.cardInner}>
        <span className={`t-caption ${styles.pill}`}>Canlı</span>
        <div>
          <h2 className={`t-h3 ${styles.cardTitle}`}>@{entry.username}</h2>
          <p className={`t-body ${styles.cardBody}`}>
            Yayın şu anda açık. Tek adımla izleme yüzeyine geç.
          </p>
        </div>
        <span className={`t-label ${styles.cardAction}`}>Canlı izle</span>
      </article>
    </Link>
  );
}
