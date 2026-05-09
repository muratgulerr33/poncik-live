import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { accounts } from "@/db/schema";

import { AUTH_COPY } from "../_lib/auth-copy";
import { hashPassword, verifyPassword } from "./auth-password-boundary";
import { readCurrentSessionState, replaceAccountSession } from "./auth-session-boundary";

type PasswordUpdateResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

function validateNextPassword(input: {
  newPassword: string;
  confirmPassword: string;
}) {
  if (input.newPassword.length < 8 || input.newPassword.length > 72) {
    return AUTH_COPY.settingsPasswordPolicyBody;
  }

  if (input.confirmPassword !== input.newPassword) {
    return AUTH_COPY.settingsPasswordMismatchBody;
  }

  return null;
}

export async function updateCurrentAccountPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<PasswordUpdateResult> {
  const sessionState = await readCurrentSessionState();

  if (sessionState.kind !== "authenticated") {
    return {
      ok: false,
      message: AUTH_COPY.settingsPasswordUnavailableBody
    };
  }

  const currentSession = sessionState.session;

  if (
    (currentSession.roleType !== "user" && currentSession.roleType !== "publisher") ||
    currentSession.accountStatus !== "active"
  ) {
    return {
      ok: false,
      message: AUTH_COPY.settingsPasswordUnavailableBody
    };
  }

  try {
    const db = getDb();
    const accountRows = await db
      .select({
        passwordHash: accounts.passwordHash
      })
      .from(accounts)
      .where(eq(accounts.id, currentSession.accountId))
      .limit(1);

    const account = accountRows[0];

    if (!account) {
      return {
        ok: false,
        message: AUTH_COPY.settingsPasswordUnavailableBody
      };
    }

    const isValidCurrentPassword = await verifyPassword(
      input.currentPassword,
      account.passwordHash
    );

    if (!isValidCurrentPassword) {
      return {
        ok: false,
        message: AUTH_COPY.settingsPasswordWrongCurrentBody
      };
    }

    const passwordValidationMessage = validateNextPassword({
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword
    });

    if (passwordValidationMessage) {
      return {
        ok: false,
        message: passwordValidationMessage
      };
    }

    if (input.newPassword === input.currentPassword) {
      return {
        ok: false,
        message: AUTH_COPY.settingsPasswordSameAsOldBody
      };
    }

    const passwordHash = await hashPassword(input.newPassword);
    const updatedRows = await db
      .update(accounts)
      .set({
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(accounts.id, currentSession.accountId))
      .returning({
        id: accounts.id
      });

    if (!updatedRows[0]) {
      return {
        ok: false,
        message: AUTH_COPY.settingsPasswordUnavailableBody
      };
    }

    await replaceAccountSession(currentSession.accountId);

    return {
      ok: true
    };
  } catch {
    return {
      ok: false,
      message: AUTH_COPY.settingsPasswordUnavailableBody
    };
  }
}
