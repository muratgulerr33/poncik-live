import { and, asc, desc, eq, notInArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  accounts,
  broadcasts,
  coverImages,
  publisherApplications,
  publisherSettings
} from "@/db/schema";

const LIVE_BROADCAST_STATUS = "live";
const PUBLISHER_ROLE = "publisher";
const APPROVED_APPLICATION_STATUS = "approved";

export type DiscoveryEntry = {
  id: string;
  username: string;
  href: string;
  coverImageId: string | null;
  coverImageStorageKey: string | null;
};

export type ApprovedOfflineDiscoveryEntry = {
  id: string;
  username: string;
  href: string | null;
  coverImageId: string | null;
  coverImageStorageKey: string | null;
};

export type DiscoveryResult =
  | {
      kind: "ok";
      entries: DiscoveryEntry[];
      approvedOfflineEntries: ApprovedOfflineDiscoveryEntry[];
    }
  | {
      kind: "error";
    };

export type WatchViewModel =
  | {
      kind: "live";
      broadcasterAccountId: string;
      username: string;
    }
  | {
      kind: "ended";
      username: string;
    }
  | {
      kind: "unavailable";
      username: string;
      reason: "missing-broadcaster" | "missing-broadcast" | "read-error";
    };

export async function readDiscoveryEntries(): Promise<DiscoveryResult> {
  try {
    const db = getDb();
    const liveRows = await db
      .select({
        publisherAccountId: broadcasts.publisherAccountId,
        username: accounts.username,
        coverImageId: publisherSettings.coverImageId,
        coverImageStorageKey: coverImages.storageKey
      })
      .from(broadcasts)
      .innerJoin(accounts, eq(accounts.id, broadcasts.publisherAccountId))
      .leftJoin(
        publisherSettings,
        eq(publisherSettings.accountId, accounts.id)
      )
      .leftJoin(coverImages, eq(coverImages.id, publisherSettings.coverImageId))
      .where(
        and(
          eq(broadcasts.status, LIVE_BROADCAST_STATUS),
          eq(accounts.roleType, PUBLISHER_ROLE)
        )
      )
      .orderBy(desc(broadcasts.updatedAt));

    const liveEntries: DiscoveryEntry[] = [];
    const livePublisherIds = new Set<string>();

    for (const row of liveRows) {
      if (livePublisherIds.has(row.publisherAccountId)) {
        continue;
      }

      livePublisherIds.add(row.publisherAccountId);
      liveEntries.push({
        id: row.username,
        username: row.username,
        href: `/live/${row.username}`,
        coverImageId: row.coverImageId,
        coverImageStorageKey: row.coverImageStorageKey
      });
    }

    const approvedOfflineRows = await db
      .select({
        id: accounts.id,
        username: accounts.username,
        coverImageId: publisherSettings.coverImageId,
        coverImageStorageKey: coverImages.storageKey
      })
      .from(accounts)
      .innerJoin(
        publisherApplications,
        eq(publisherApplications.accountId, accounts.id)
      )
      .leftJoin(
        publisherSettings,
        eq(publisherSettings.accountId, accounts.id)
      )
      .leftJoin(coverImages, eq(coverImages.id, publisherSettings.coverImageId))
      .where(
        livePublisherIds.size === 0
          ? and(
              eq(accounts.roleType, PUBLISHER_ROLE),
              eq(
                publisherApplications.status,
                APPROVED_APPLICATION_STATUS
              )
            )
          : and(
              eq(accounts.roleType, PUBLISHER_ROLE),
              eq(
                publisherApplications.status,
                APPROVED_APPLICATION_STATUS
              ),
              notInArray(accounts.id, Array.from(livePublisherIds))
            )
      )
      .orderBy(asc(accounts.username));

    return {
      kind: "ok",
      entries: liveEntries,
      approvedOfflineEntries: approvedOfflineRows.map((row) => ({
        id: row.id,
        username: row.username,
        href: null,
        coverImageId: row.coverImageId,
        coverImageStorageKey: row.coverImageStorageKey
      }))
    };
  } catch {
    return {
      kind: "error"
    };
  }
}

export async function readWatchView(username: string): Promise<WatchViewModel> {
  try {
    const db = getDb();
    const broadcasterRows = await db
      .select({
        id: accounts.id,
        username: accounts.username
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.username, username),
          eq(accounts.roleType, PUBLISHER_ROLE)
        )
      )
      .limit(1);

    const broadcaster = broadcasterRows[0];

    if (!broadcaster) {
      return {
        kind: "unavailable",
        username,
        reason: "missing-broadcaster"
      };
    }

    const latestBroadcastRows = await db
      .select({
        status: broadcasts.status
      })
      .from(broadcasts)
      .where(eq(broadcasts.publisherAccountId, broadcaster.id))
      .orderBy(desc(broadcasts.updatedAt))
      .limit(1);

    const latestBroadcast = latestBroadcastRows[0];

    if (!latestBroadcast) {
      return {
        kind: "unavailable",
        username: broadcaster.username,
        reason: "missing-broadcast"
      };
    }

    if (latestBroadcast.status === LIVE_BROADCAST_STATUS) {
      return {
        broadcasterAccountId: broadcaster.id,
        kind: "live",
        username: broadcaster.username
      };
    }

    return {
      kind: "ended",
      username: broadcaster.username
    };
  } catch {
    return {
      kind: "unavailable",
      username,
      reason: "read-error"
    };
  }
}
