import { DiscoveryCard } from "../_components/discovery-card";
import { DiscoveryFreshness } from "../_components/discovery-freshness";
import {
  DiscoveryEmptyState,
  DiscoveryErrorState
} from "../_components/discovery-state";
import { DiscoveryShell } from "../_components/discovery-shell";
import { readDiscoveryEntries } from "../_lib/public-live-read";

import styles from "../_components/discovery.module.css";

export async function DiscoveryController() {
  const result = await readDiscoveryEntries();

  if (result.kind === "error") {
    return (
      <DiscoveryShell>
        <DiscoveryErrorState />
        <DiscoveryFreshness />
      </DiscoveryShell>
    );
  }

  if (result.entries.length === 0) {
    return (
      <DiscoveryShell>
        <DiscoveryEmptyState />
        <DiscoveryFreshness />
      </DiscoveryShell>
    );
  }

  return (
    <DiscoveryShell>
      <div className={styles.grid}>
        {result.entries.map((entry) => (
          <DiscoveryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <DiscoveryFreshness />
    </DiscoveryShell>
  );
}
