import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts, broadcasts } from "@/db/schema";

import { createStudioBroadcastLivenessReconciler } from "./studio-broadcast-liveness-adapter";

const LIVE_STATUS = "live";
const ENDED_STATUS = "ended";

export type CurrentStudioBroadcastState =
  | {
      kind: "live";
      broadcastId: string;
    }
  | {
      kind: "idle";
    }
  | {
      kind: "degraded";
    };

export async function readCurrentActiveBroadcast(
  accountId: string
): Promise<CurrentStudioBroadcastState> {
  try {
    const db = getDb();
    const reconcileLiveBroadcast = createStudioBroadcastLivenessReconciler();
    const rows = await db
      .select({
        id: broadcasts.id,
        updatedAt: broadcasts.updatedAt,
        username: accounts.username
      })
      .from(broadcasts)
      .innerJoin(accounts, eq(accounts.id, broadcasts.publisherAccountId))
      .where(
        and(
          eq(broadcasts.publisherAccountId, accountId),
          eq(broadcasts.status, LIVE_STATUS)
        )
      )
      .orderBy(desc(broadcasts.updatedAt))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return {
        kind: "idle"
      };
    }

    const reconcileResult = await reconcileLiveBroadcast({
      broadcastId: row.id,
      publisherAccountId: accountId,
      updatedAt: row.updatedAt,
      username: row.username
    });

    if (reconcileResult.kind !== "keep_live") {
      return {
        kind: "idle"
      };
    }

    return {
      kind: "live",
      broadcastId: row.id
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

export async function markBroadcastCloseCandidateForPublisher(accountId: string) {
  return touchCurrentLiveBroadcastForPublisher(accountId);
}

async function touchCurrentLiveBroadcastForPublisher(accountId: string) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const activeRows = await tx
      .select({
        id: broadcasts.id
      })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.publisherAccountId, accountId),
          eq(broadcasts.status, LIVE_STATUS)
        )
      )
      .orderBy(desc(broadcasts.updatedAt))
      .limit(1);

    const activeRow = activeRows[0];

    if (!activeRow) {
      return {
        kind: "noop" as const
      };
    }

    await tx
      .update(broadcasts)
      .set({
        updatedAt: new Date()
      })
      .where(eq(broadcasts.id, activeRow.id));

    return {
      kind: "touched" as const,
      broadcastId: activeRow.id
    };
  });
}

export async function startBroadcastForPublisher(accountId: string) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const existingRows = await tx
      .select({
        id: broadcasts.id
      })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.publisherAccountId, accountId),
          eq(broadcasts.status, LIVE_STATUS)
        )
      )
      .orderBy(desc(broadcasts.updatedAt))
      .limit(1);

    const existingRow = existingRows[0];

    if (existingRow) {
      return {
        kind: "live" as const,
        broadcastId: existingRow.id
      };
    }

    const now = new Date();
    const insertedRows = await tx
      .insert(broadcasts)
      .values({
        publisherAccountId: accountId,
        status: LIVE_STATUS,
        startedAt: now,
        updatedAt: now
      })
      .returning({
        id: broadcasts.id
      });

    return {
      kind: "live" as const,
      broadcastId: insertedRows[0].id
    };
  });
}

export async function stopBroadcastForPublisher(accountId: string) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const activeRows = await tx
      .select({
        id: broadcasts.id
      })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.publisherAccountId, accountId),
          eq(broadcasts.status, LIVE_STATUS)
        )
      )
      .orderBy(desc(broadcasts.updatedAt))
      .limit(1);

    const activeRow = activeRows[0];

    if (!activeRow) {
      return {
        kind: "noop" as const
      };
    }

    const now = new Date();
    await tx
      .update(broadcasts)
      .set({
        status: ENDED_STATUS,
        endedAt: now,
        updatedAt: now
      })
      .where(eq(broadcasts.id, activeRow.id));

    return {
      kind: "stopped" as const,
      broadcastId: activeRow.id
    };
  });
}
