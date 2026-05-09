const INVALID_USERNAME_MESSAGE =
  "Kullanıcı adı yalnız küçük harf, rakam, nokta, tire ve alt tire içerebilir.";
const USERNAME_LENGTH_MESSAGE =
  "Kullanıcı adı 3 ile 24 karakter arasında olmalı.";
const USERNAME_EDGE_MESSAGE =
  "Kullanıcı adı nokta, tire veya alt tire ile başlayıp bitemez; ardışık nokta içeremez.";
const RESERVED_USERNAME_MESSAGE = "Bu kullanıcı adı kullanılamaz.";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 24;
const USERNAME_ALLOWED_PATTERN = /^[a-z0-9._-]+$/;
const USERNAME_EDGE_PATTERN = /^[._-]|[._-]$/;
const RESERVED_USERNAMES = new Set([
  "auth",
  "api",
  "studio",
  "live",
  "admin",
  "settings",
  "account",
  "profile",
  "support"
]);

export type AuthUsernameValidationResult =
  | {
      ok: true;
      username: string;
    }
  | {
      ok: false;
      message: string;
    };

export function validateAuthUsernameInput(
  username: string
): AuthUsernameValidationResult {
  if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: USERNAME_LENGTH_MESSAGE
    };
  }

  if (!USERNAME_ALLOWED_PATTERN.test(username)) {
    return {
      ok: false,
      message: INVALID_USERNAME_MESSAGE
    };
  }

  if (USERNAME_EDGE_PATTERN.test(username) || username.includes("..")) {
    return {
      ok: false,
      message: USERNAME_EDGE_MESSAGE
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return {
      ok: false,
      message: RESERVED_USERNAME_MESSAGE
    };
  }

  return {
    ok: true,
    username
  };
}
