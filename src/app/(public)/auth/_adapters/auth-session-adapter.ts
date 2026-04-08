import {
  findAccountByIdentifier,
} from "./auth-account-boundary";
import {
  clearCurrentSessionCookie,
  deleteSessionByToken,
  readCurrentSessionState,
  readCurrentSessionToken,
  replaceAccountSession,
  type CurrentSession,
  type CurrentSessionReadResult
} from "./auth-session-boundary";
import { verifyPassword } from "./auth-password-boundary";

type AuthResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

const AUTH_UNAVAILABLE_MESSAGE =
  "Giriş şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene.";

function toAuthUnavailableResult(): AuthResult {
  return {
    ok: false,
    message: AUTH_UNAVAILABLE_MESSAGE
  };
}

export type { CurrentSession, CurrentSessionReadResult };

export async function readCurrentSession() {
  return readCurrentSessionState();
}

export async function signInWithPassword(input: {
  identifier: string;
  password: string;
}): Promise<AuthResult> {
  const identifier = input.identifier.trim();
  const password = input.password;

  if (!identifier || !password) {
    return {
      ok: false as const,
      message: "Giriş için tüm alanları doldur."
    };
  }

  try {
    const account = await findAccountByIdentifier(identifier);

    if (!account) {
      return {
        ok: false as const,
        message: "Giriş bilgileri doğrulanamadı."
      };
    }

    const isValidPassword = await verifyPassword(password, account.passwordHash);

    if (!isValidPassword) {
      return {
        ok: false as const,
        message: "Giriş bilgileri doğrulanamadı."
      };
    }

    await replaceAccountSession(account.id);

    return {
      ok: true as const
    };
  } catch {
    return toAuthUnavailableResult();
  }
}

export async function signOutCurrentSession(): Promise<AuthResult> {
  const sessionToken = await readCurrentSessionToken();

  try {
    if (sessionToken) {
      await deleteSessionByToken(sessionToken);
    }

    await clearCurrentSessionCookie();

    return {
      ok: true as const
    };
  } catch {
    await clearCurrentSessionCookie();

    return {
      ok: false,
      message: "Çıkış tamamlandı, ancak oturum durumu şu anda yeniden doğrulanamıyor."
    };
  }
}
