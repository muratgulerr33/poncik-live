import { getDb } from "@/db/client";
import { accounts, authSessions } from "@/db/schema";

import {
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_USER_ROLE,
  findExistingAccounts,
  getAccountWriteConflictTarget,
  getExistingAccountConflictMessage,
  sanitizeEmail
} from "./auth-account-boundary";
import { validateAuthUsernameInput } from "../_lib/auth-username-policy";
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
  "Kayıt şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene.";

export async function registerUserAccount(input: {
  email: string;
  username: string;
  password: string;
}): Promise<RegisterResult> {
  const email = sanitizeEmail(input.email);
  const rawUsername = input.username;
  const password = input.password;

  if (!email || !rawUsername || !password) {
    return {
      ok: false,
      message: "Kayıt için tüm alanları doldur."
    };
  }

  const usernameValidation = validateAuthUsernameInput(rawUsername);

  if (!usernameValidation.ok) {
    return {
      ok: false,
      message: usernameValidation.message
    };
  }

  const username = usernameValidation.username;

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
          roleType: DEFAULT_USER_ROLE,
          accountStatus: DEFAULT_ACCOUNT_STATUS
        })
        .returning({
          id: accounts.id
        });

      const insertedAccountId = insertedAccounts[0]?.id ?? null;

      if (!insertedAccountId) {
        return null;
      }

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
  } catch (error) {
    const conflictTarget = getAccountWriteConflictTarget(error);

    if (conflictTarget === "username") {
      return {
        ok: false,
        message: "Bu kullanıcı adı zaten kullanılıyor."
      };
    }

    if (conflictTarget === "email") {
      return {
        ok: false,
        message: "Bu e-posta zaten kullanılıyor."
      };
    }

    return {
      ok: false,
      message: REGISTER_UNAVAILABLE_MESSAGE
    };
  }
}
