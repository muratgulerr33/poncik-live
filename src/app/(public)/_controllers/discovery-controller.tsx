import { DiscoveryCard } from "../_components/discovery-card";
import { DiscoveryFreshness } from "../_components/discovery-freshness";
import { DiscoveryRouteShell } from "../_components/discovery-route-shell";
import { DiscoverySection } from "../_components/discovery-section";
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

  const liveEntries = result.entries;
  const offlineEntries = result.approvedOfflineEntries;

  if (liveEntries.length === 0 && offlineEntries.length === 0) {
    return (
      <DiscoveryRouteShell session={session}>
        <DiscoveryEmptyState />
        <DiscoveryFreshness />
      </DiscoveryRouteShell>
    );
  }

  return (
    <DiscoveryRouteShell session={session}>
      <div className={styles.section}>
        {liveEntries.length > 0 ? (
          <DiscoverySection title="Şu anda canlı">
            <div className={styles.grid}>
              {liveEntries.map((entry) => (
                <DiscoveryCard
                  key={entry.id}
                  kind="live"
                  username={entry.username}
                  href={entry.href}
                  coverImageStorageKey={entry.coverImageStorageKey}
                />
              ))}
            </div>
          </DiscoverySection>
        ) : (
          <DiscoveryEmptyState />
        )}

        {offlineEntries.length > 0 ? (
          <DiscoverySection title="Diğer yayıncılar">
            <div className={styles.grid}>
              {offlineEntries.map((entry) => (
                <DiscoveryCard
                  key={entry.id}
                  kind="offline"
                  username={entry.username}
                  href={entry.href}
                  coverImageStorageKey={entry.coverImageStorageKey}
                />
              ))}
            </div>
          </DiscoverySection>
        ) : null}
      </div>
      <DiscoveryFreshness />
    </DiscoveryRouteShell>
  );
}
