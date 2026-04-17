import { DiscoveryCard } from "../_components/discovery-card";
import { DiscoveryFreshness } from "../_components/discovery-freshness";
import { type DiscoveryRouteMenuItem } from "../_components/discovery-route-shell";
import { DiscoveryRouteShell } from "../_components/discovery-route-shell";
import { DiscoverySection } from "../_components/discovery-section";
import {
  DiscoveryEmptyState,
  DiscoveryErrorState
} from "../_components/discovery-state";
import { readPublisherApplicationStatus } from "../auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../auth/_adapters/auth-session-adapter";
import { readDiscoveryEntries } from "../_lib/public-live-read";

import styles from "../_components/discovery.module.css";

export async function DiscoveryController() {
  const sessionState = await readCurrentSession();
  const result = await readDiscoveryEntries();
  let menuItems: DiscoveryRouteMenuItem[] = [
    {
      type: "link",
      label: "Keşfet",
      href: "/",
      isCurrent: true
    },
    {
      type: "link",
      label: "Giriş yap",
      href: "/auth"
    },
    {
      type: "link",
      label: "Kayıt ol",
      href: "/auth"
    },
    {
      type: "link",
      label: "Sen de yayıncı ol",
      href: "/auth"
    },
    {
      type: "action",
      label: "Canlı Destek",
      actionId: "support"
    }
  ];
  const session =
    sessionState.kind === "authenticated"
      ? {
          kind: "authenticated" as const,
          username: sessionState.session.username
        }
      : {
          kind: sessionState.kind
        };

  if (sessionState.kind === "authenticated") {
    if (sessionState.session.roleType === "admin") {
      menuItems = [
        {
          type: "link",
          label: "Operasyon",
          href: "/auth"
        },
        {
          type: "disabled",
          label: "Ödemeler"
        },
        {
          type: "disabled",
          label: "Raporlar"
        }
      ];
    } else if (sessionState.session.roleType === "user") {
      menuItems = [
        {
          type: "link",
          label: "Keşfet",
          href: "/",
          isCurrent: true
        },
        {
          type: "link",
          label: "Hesabım",
          href: "/auth"
        },
        {
          type: "action",
          label: "Canlı Destek",
          actionId: "support"
        }
      ];
    } else if (sessionState.session.roleType === "publisher") {
      const applicationState = await readPublisherApplicationStatus(
        sessionState.session.accountId
      );
      const liveItem =
        applicationState.kind === "found" && applicationState.status === "approved"
          ? [
              {
                type: "link" as const,
                label: "Canlı Yayın",
                href: "/studio"
              }
            ]
          : [];

      menuItems = [
        {
          type: "link",
          label: "Keşfet",
          href: "/",
          isCurrent: true
        },
        ...liveItem,
        {
          type: "link",
          label: "Hesabım",
          href: "/auth"
        },
        {
          type: "action",
          label: "Canlı Destek",
          actionId: "support"
        }
      ];
    }
  }

  if (result.kind === "error") {
    return (
      <DiscoveryRouteShell menuItems={menuItems} session={session}>
        <DiscoveryErrorState />
        <DiscoveryFreshness />
      </DiscoveryRouteShell>
    );
  }

  const liveEntries = result.entries;
  const offlineEntries = result.approvedOfflineEntries;

  if (liveEntries.length === 0 && offlineEntries.length === 0) {
    return (
      <DiscoveryRouteShell menuItems={menuItems} session={session}>
        <DiscoveryEmptyState />
        <DiscoveryFreshness />
      </DiscoveryRouteShell>
    );
  }

  return (
    <DiscoveryRouteShell menuItems={menuItems} session={session}>
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
          <DiscoverySection title="Tüm yayıncılar">
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
