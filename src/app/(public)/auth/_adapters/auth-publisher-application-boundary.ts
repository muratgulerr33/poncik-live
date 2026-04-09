import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts, publisherApplications } from "@/db/schema";

export type PublisherApplicationReadResult =
  | {
      kind: "found";
      status: string;
    }
  | {
      kind: "missing";
    }
  | {
      kind: "degraded";
    };

export type PendingPublisherApplication = {
  id: string;
  accountId: string;
  fullName: string;
  phone: string;
  email: string;
  username: string;
  createdAt: Date;
};

export type PendingPublisherQueueResult =
  | {
      kind: "found";
      items: PendingPublisherApplication[];
    }
  | {
      kind: "degraded";
    };

export async function readPublisherApplicationStatus(
  accountId: string
): Promise<PublisherApplicationReadResult> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        status: publisherApplications.status
      })
      .from(publisherApplications)
      .where(eq(publisherApplications.accountId, accountId))
      .limit(1);

    const row = rows[0];

    if (!row) {
      return {
        kind: "missing"
      };
    }

    return {
      kind: "found",
      status: row.status
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

export async function readPendingPublisherApplications(): Promise<PendingPublisherQueueResult> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: publisherApplications.id,
        accountId: publisherApplications.accountId,
        fullName: publisherApplications.fullName,
        phone: publisherApplications.phone,
        email: accounts.email,
        username: accounts.username,
        createdAt: publisherApplications.createdAt
      })
      .from(publisherApplications)
      .innerJoin(accounts, eq(accounts.id, publisherApplications.accountId))
      .where(eq(publisherApplications.status, "pending_review"));

    return {
      kind: "found",
      items: rows
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

type DbTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

export async function createPublisherApplication(
  tx: DbTransaction,
  input: {
    accountId: string;
    fullName: string;
    phone: string;
  }
) {
  await tx.insert(publisherApplications).values({
    accountId: input.accountId,
    fullName: input.fullName,
    phone: input.phone,
    status: "pending_review"
  });
}

export async function reviewPendingPublisherApplication(input: {
  applicationId: string;
  reviewerAccountId: string;
  nextStatus: "approved" | "rejected";
}) {
  const db = getDb();
  const updated = await db
    .update(publisherApplications)
    .set({
      status: input.nextStatus,
      reviewedByAccountId: input.reviewerAccountId,
      reviewedAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      and(
        eq(publisherApplications.id, input.applicationId),
        eq(publisherApplications.status, "pending_review")
      )
    )
    .returning({
      id: publisherApplications.id
    });

  return updated[0] ?? null;
}
