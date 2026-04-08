import { getDb } from "@/db/client";
import { accounts, authSessions } from "@/db/schema";

import {
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_PUBLISHER_ROLE,
  findExistingAccounts,
  getExistingAccountConflictMessage,
  sanitizeEmail,
  sanitizeUsername
} from "./auth-account-boundary";
import { createPublisherApplication } from "./auth-publisher-application-boundary";
import { hashPassword } from "./auth-password-boundary";
import {
  createRegisterSessionSeed,
  persistRegisterSession
} from "./auth-register-session-boundary";

type RegisterResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

const REGISTER_UNAVAILABLE_MESSAGE =
  "Başvuru şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene.";

export async function registerPublisherAccount(input: {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const fullName = input.fullName.trim();
  const username = sanitizeUsername(input.username);
  const phone = input.phone.trim();
  const email = sanitizeEmail(input.email);
  const password = input.password;

  if (!fullName || !username || !phone || !email || !password) {
    return {
      ok: false,
      message: "Başvuru için tüm alanları doldur."
    };
  }

  try {
    const existingAccounts = await findExistingAccounts(email, username);
    const conflictMessage = getExistingAccountConflictMessage(email, username, existingAccounts);

    if (conflictMessage) {
      return {
        ok: false,
        message: conflictMessage
      };
    }

    const passwordHash = await hashPassword(password);
    const db = getDb();
    const sessionSeed = createRegisterSessionSeed();
    const accountId = await db.transaction(async (tx) => {
      const insertedAccounts = await tx
        .insert(accounts)
        .values({
          email,
          username,
          passwordHash,
          roleType: DEFAULT_PUBLISHER_ROLE,
          accountStatus: DEFAULT_ACCOUNT_STATUS
        })
        .returning({
          id: accounts.id
        });

      const insertedAccountId = insertedAccounts[0]?.id ?? null;

      if (!insertedAccountId) {
        return null;
      }

      await createPublisherApplication(tx, {
        accountId: insertedAccountId,
        fullName,
        phone
      });

      await tx.insert(authSessions).values({
        accountId: insertedAccountId,
        sessionToken: sessionSeed.sessionToken,
        expiresAt: sessionSeed.expiresAt
      });

      return insertedAccountId;
    });

    if (!accountId) {
      return {
        ok: false,
        message: REGISTER_UNAVAILABLE_MESSAGE
      };
    }

    const sessionResult = await persistRegisterSession(sessionSeed);

    if (!sessionResult.ok) {
      return {
        ok: false,
        message: REGISTER_UNAVAILABLE_MESSAGE
      };
    }

    return {
      ok: true
    };
  } catch {
    return {
      ok: false,
      message: REGISTER_UNAVAILABLE_MESSAGE
    };
  }
}
