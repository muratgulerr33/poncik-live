import { type ReactNode } from "react";

import styles from "./discovery.module.css";

type DiscoverySectionProps = Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
}>;

export function DiscoverySection({
  title,
  description,
  children
}: DiscoverySectionProps) {
  return (
    <section className={styles.discoverySection}>
      <div className={styles.discoverySectionHeader}>
        <h2 className={`t-h3 ${styles.discoverySectionTitle}`}>{title}</h2>
        {description ? (
          <p className={`t-body ${styles.discoverySectionDescription}`}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
