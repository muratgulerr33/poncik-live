import { DiscoveryCard } from "../_components/discovery-card";
import { DiscoveryFreshness } from "../_components/discovery-freshness";
import { DiscoveryRouteShell } from "../_components/discovery-route-shell";
import {
  DiscoveryEmptyState,
  DiscoveryErrorState
} from "../_components/discovery-state";
import { readCurrentSession } from "../auth/_adapters/auth-session-adapter";
import { readDiscoveryEntries } from "../_lib/public-live-read";

import styles from "../_components/discovery.module.css";

export async function DiscoveryController() {
  const sessionState = await readCurrentSession();
  const result = await readDiscoveryEntries();
  const session =
    sessionState.kind === "authenticated"
      ? {
          kind: "authenticated" as const,
          username: sessionState.session.username
        }
      : {
          kind: sessionState.kind
        };

  if (result.kind === "error") {
    return (
      <DiscoveryRouteShell session={session}>
        <DiscoveryErrorState />
        <DiscoveryFreshness />
      </DiscoveryRouteShell>
    );
  }

  if (result.entries.length === 0) {
    return (
      <DiscoveryRouteShell session={session}>
        <DiscoveryEmptyState />
        <DiscoveryFreshness />
      </DiscoveryRouteShell>
    );
  }

  return (
    <DiscoveryRouteShell session={session}>
      <div className={styles.grid}>
        {result.entries.map((entry) => (
          <DiscoveryCard key={entry.id} entry={entry} />
        ))}
      </div>
      <DiscoveryFreshness />
    </DiscoveryRouteShell>
  );
}
