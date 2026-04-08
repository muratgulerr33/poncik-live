import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts, authSessions } from "@/db/schema";

import {
  clearSessionCookie,
  readSessionTokenFromCookie,
  writeSessionCookie
} from "./auth-cookie-boundary";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type CurrentSession = {
  accountId: string;
  email: string;
  username: string;
  roleType: string;
  accountStatus: string;
  expiresAt: Date;
};

export type CurrentSessionReadResult =
  | {
      kind: "authenticated";
      session: CurrentSession;
    }
  | {
      kind: "anonymous";
    }
  | {
      kind: "degraded";
      message: string;
    };

function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function readCurrentSessionState(): Promise<CurrentSessionReadResult> {
  const sessionToken = await readSessionTokenFromCookie();

  if (!sessionToken) {
    return {
      kind: "anonymous"
    };
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        accountId: accounts.id,
        email: accounts.email,
        username: accounts.username,
        roleType: accounts.roleType,
        accountStatus: accounts.accountStatus,
        expiresAt: authSessions.expiresAt
      })
      .from(authSessions)
      .innerJoin(accounts, eq(accounts.id, authSessions.accountId))
      .where(eq(authSessions.sessionToken, sessionToken))
      .limit(1);

    const row = rows[0];

    if (!row) {
      await clearSessionCookie();

      return {
        kind: "anonymous"
      };
    }

    if (row.expiresAt.getTime() <= Date.now()) {
      await deleteSessionByToken(sessionToken);
      await clearSessionCookie();

      return {
        kind: "anonymous"
      };
    }

    return {
      kind: "authenticated",
      session: row
    };
  } catch {
    return {
      kind: "degraded",
      message: "Oturum durumu şu anda doğrulanamıyor. Auth yüzeyi yine de açıldı."
    };
  }
}

export async function replaceAccountSession(accountId: string) {
  const db = getDb();
  const sessionToken = randomBytes(24).toString("hex");
  const expiresAt = getSessionExpiryDate();

  await db.delete(authSessions).where(eq(authSessions.accountId, accountId));
  await db.insert(authSessions).values({
    accountId,
    sessionToken,
    expiresAt
  });

  await writeSessionCookie(sessionToken, expiresAt);
}

export async function deleteSessionByToken(sessionToken: string) {
  const db = getDb();

  await db.delete(authSessions).where(eq(authSessions.sessionToken, sessionToken));
}

export async function clearCurrentSessionCookie() {
  await clearSessionCookie();
}

export async function readCurrentSessionToken() {
  return readSessionTokenFromCookie();
}
