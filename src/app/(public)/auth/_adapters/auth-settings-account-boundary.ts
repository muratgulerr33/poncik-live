import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPublicLivePath } from "@/app/(public)/_lib/public-live-path";
import { readCurrentActiveBroadcast } from "@/app/(studio)/studio/_adapters/studio-broadcast-adapter";
import { getDb } from "@/db/client";
import { accounts } from "@/db/schema";

import { getAccountWriteConflictTarget } from "./auth-account-boundary";
import { readCurrentSessionState } from "./auth-session-boundary";
import { validateAuthUsernameInput } from "../_lib/auth-username-policy";
import { AUTH_COPY } from "../_lib/auth-copy";

type UsernameUpdateResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

const USERNAME_DUPLICATE_MESSAGE = "Bu kullanıcı adı zaten kullanılıyor.";
const USERNAME_UNAVAILABLE_MESSAGE =
  "Kullanıcı adı şu anda güncellenemiyor. Lütfen daha sonra tekrar dene.";
const USERNAME_LIVE_BLOCK_MESSAGE =
  "Canlı yayın sırasında kullanıcı adı değiştirilemez. Yayını bitirip tekrar dene.";

function revalidateUsernamePaths(previousUsername: string, nextUsername: string) {
  revalidatePath("/auth");
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath(getPublicLivePath(previousUsername));
  revalidatePath(getPublicLivePath(nextUsername));
}

export async function updateCurrentAccountUsername(input: {
  username: string;
}): Promise<UsernameUpdateResult> {
  const usernameValidation = validateAuthUsernameInput(input.username);

  if (!usernameValidation.ok) {
    return {
      ok: false,
      message: usernameValidation.message
    };
  }

  const sessionState = await readCurrentSessionState();

  if (sessionState.kind !== "authenticated") {
    return {
      ok: false,
      message: USERNAME_UNAVAILABLE_MESSAGE
    };
  }

  const currentSession = sessionState.session;

  if (
    (currentSession.roleType !== "user" && currentSession.roleType !== "publisher") ||
    currentSession.accountStatus !== "active"
  ) {
    return {
      ok: false,
      message: USERNAME_UNAVAILABLE_MESSAGE
    };
  }

  const username = usernameValidation.username;

  if (username === currentSession.username) {
    return {
      ok: false,
      message: AUTH_COPY.settingsUsernameSameValueBody
    };
  }

  if (currentSession.roleType === "publisher") {
    const liveState = await readCurrentActiveBroadcast(currentSession.accountId);

    if (liveState.kind === "live") {
      return {
        ok: false,
        message: USERNAME_LIVE_BLOCK_MESSAGE
      };
    }

    if (liveState.kind === "degraded") {
      return {
        ok: false,
        message: USERNAME_UNAVAILABLE_MESSAGE
      };
    }
  }

  try {
    const db = getDb();
    const existingRows = await db
      .select({
        id: accounts.id
      })
      .from(accounts)
      .where(
        and(eq(accounts.username, username), ne(accounts.id, currentSession.accountId))
      )
      .limit(1);

    if (existingRows[0]) {
      return {
        ok: false,
        message: USERNAME_DUPLICATE_MESSAGE
      };
    }

    const updatedRows = await db
      .update(accounts)
      .set({
        username,
        updatedAt: new Date()
      })
      .where(
        eq(accounts.id, currentSession.accountId)
      )
      .returning({
        id: accounts.id
      });

    if (!updatedRows[0]) {
      return {
        ok: false,
        message: USERNAME_UNAVAILABLE_MESSAGE
      };
    }

    revalidateUsernamePaths(currentSession.username, username);

    return {
      ok: true
    };
  } catch (error) {
    if (getAccountWriteConflictTarget(error) === "username") {
      return {
        ok: false,
        message: USERNAME_DUPLICATE_MESSAGE
      };
    }

    return {
      ok: false,
      message: USERNAME_UNAVAILABLE_MESSAGE
    };
  }
}
