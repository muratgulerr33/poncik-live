import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { coverImages, publisherSettings } from "@/db/schema";

export type AuthCoverCatalogItem = {
  id: string;
  storageKey: string;
  previewSrc: string;
  label: string;
};

export type AuthCoverCatalogReadResult =
  | {
      kind: "ready" | "empty-selected";
      selectedCoverImageId: string | null;
      items: AuthCoverCatalogItem[];
    }
  | {
      kind: "degraded";
    };

export type AuthCoverSelectionWriteResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "invalid-cover" | "data-anomaly" | "unavailable";
    };

function toCoverPreviewSrc(storageKey: string) {
  return `/${storageKey}`;
}

function toCoverLabel(storageKey: string) {
  const fileName = storageKey.split("/").pop() ?? storageKey;
  const match = /^cover-(\d+)\.[a-z0-9]+$/i.exec(fileName);

  if (!match) {
    return "Kapak";
  }

  return `Kapak ${match[1]}`;
}

export async function readPublisherCoverCatalog(
  accountId: string
): Promise<AuthCoverCatalogReadResult> {
  try {
    const db = getDb();
    const [catalogRows, settingsRows] = await Promise.all([
      db
        .select({
          id: coverImages.id,
          storageKey: coverImages.storageKey
        })
        .from(coverImages)
        .orderBy(asc(coverImages.storageKey)),
      db
        .select({
          id: publisherSettings.id,
          coverImageId: publisherSettings.coverImageId
        })
        .from(publisherSettings)
        .where(eq(publisherSettings.accountId, accountId))
    ]);

    if (catalogRows.length === 0 || settingsRows.length > 1) {
      return {
        kind: "degraded"
      };
    }

    const selectedCoverImageId = settingsRows[0]?.coverImageId ?? null;
    const items = catalogRows.map((row) => ({
      id: row.id,
      storageKey: row.storageKey,
      previewSrc: toCoverPreviewSrc(row.storageKey),
      label: toCoverLabel(row.storageKey)
    }));

    return {
      kind: selectedCoverImageId ? "ready" : "empty-selected",
      selectedCoverImageId,
      items
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

export async function savePublisherCoverSelection(input: {
  accountId: string;
  coverImageId: string;
}): Promise<AuthCoverSelectionWriteResult> {
  try {
    const db = getDb();

    return db.transaction(async (tx) => {
      const matchingCoverRows = await tx
        .select({
          id: coverImages.id
        })
        .from(coverImages)
        .where(eq(coverImages.id, input.coverImageId))
        .limit(1);

      if (!matchingCoverRows[0]) {
        return {
          ok: false as const,
          reason: "invalid-cover" as const
        };
      }

      const settingsRows = await tx
        .select({
          id: publisherSettings.id
        })
        .from(publisherSettings)
        .where(eq(publisherSettings.accountId, input.accountId));

      if (settingsRows.length > 1) {
        return {
          ok: false as const,
          reason: "data-anomaly" as const
        };
      }

      if (settingsRows[0]) {
        await tx
          .update(publisherSettings)
          .set({
            coverImageId: input.coverImageId,
            updatedAt: new Date()
          })
          .where(eq(publisherSettings.id, settingsRows[0].id));
      } else {
        await tx.insert(publisherSettings).values({
          accountId: input.accountId,
          coverImageId: input.coverImageId
        });
      }

      return {
        ok: true as const
      };
    });
  } catch {
    return {
      ok: false,
      reason: "unavailable"
    };
  }
}
