import {
  ACCOUNT_STATUS_ASSUMPTION,
  createUserAccount,
  findAccountByIdentifier,
  findExistingAccounts,
  sanitizeEmail,
  sanitizeUsername
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
import { hashPassword, verifyPassword } from "./auth-password-boundary";

type AuthResult =
  | {
      ok: true;
      accountStatusAssumption?: string;
    }
  | {
      ok: false;
      message: string;
    };

const AUTH_UNAVAILABLE_MESSAGE =
  "Auth servisi şu anda hazır değil. Ortam veya veritabanı bağlantısını kontrol et.";

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

export async function registerUserAccount(input: {
  email: string;
  username: string;
  password: string;
}): Promise<AuthResult> {
  const email = sanitizeEmail(input.email);
  const username = sanitizeUsername(input.username);
  const password = input.password;

  if (!email || !username || !password) {
    return {
      ok: false as const,
      message: "Kayıt için tüm alanları doldur."
    };
  }

  try {
    const existingAccounts = await findExistingAccounts(email, username);
    const hasEmailConflict = existingAccounts.some((row) => row.email === email);
    const hasUsernameConflict = existingAccounts.some((row) => row.username === username);

    if (hasEmailConflict) {
      return {
        ok: false as const,
        message: "Bu e-posta zaten kullanılıyor."
      };
    }

    if (hasUsernameConflict) {
      return {
        ok: false as const,
        message: "Bu kullanıcı adı zaten kullanılıyor."
      };
    }

    const passwordHash = await hashPassword(password);
    const account = await createUserAccount({
      email,
      username,
      passwordHash
    });

    if (!account) {
      return {
        ok: false as const,
        message: "Kayıt şu anda tamamlanamadı."
      };
    }

    await replaceAccountSession(account.id);

    return {
      ok: true as const,
      accountStatusAssumption: ACCOUNT_STATUS_ASSUMPTION
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
      message:
        "Oturum bu cihazda kapatıldı, fakat auth servisi şu anda tam doğrulama yapamıyor."
    };
  }
}
