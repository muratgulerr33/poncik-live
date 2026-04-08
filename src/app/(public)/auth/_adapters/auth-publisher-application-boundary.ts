import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { publisherApplications } from "@/db/schema";

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
