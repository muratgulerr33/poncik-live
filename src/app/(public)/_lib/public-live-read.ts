import { and, desc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts, broadcasts } from "@/db/schema";

const LIVE_BROADCAST_STATUS = "live";
const PUBLISHER_ROLE = "publisher";

export type DiscoveryEntry = {
  id: string;
  username: string;
  href: string;
};

export type DiscoveryResult =
  | {
      kind: "ok";
      entries: DiscoveryEntry[];
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
        publisherAccountId: broadcasts.publisherAccountId
      })
      .from(broadcasts)
      .where(eq(broadcasts.status, LIVE_BROADCAST_STATUS))
      .orderBy(desc(broadcasts.updatedAt));

    const orderedPublisherIds = Array.from(
      new Set(liveRows.map((row) => row.publisherAccountId))
    );

    if (orderedPublisherIds.length === 0) {
      return {
        kind: "ok",
        entries: []
      };
    }

    const publisherRows = await db
      .select({
        id: accounts.id,
        username: accounts.username
      })
      .from(accounts)
      .where(
        and(
          inArray(accounts.id, orderedPublisherIds),
          eq(accounts.roleType, PUBLISHER_ROLE)
        )
      );

    const publishersById = new Map(
      publisherRows.map((row) => [row.id, row.username])
    );

    const entries = orderedPublisherIds
      .map((publisherId) => publishersById.get(publisherId))
      .filter((username): username is string => Boolean(username))
      .map((username) => ({
        id: username,
        username,
        href: `/live/${username}`
      }));

    return {
      kind: "ok",
      entries
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
