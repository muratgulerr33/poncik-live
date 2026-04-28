"use server";

import { signInWithPassword } from "../../../auth/_adapters/auth-session-adapter";
import { registerUserAccount } from "../../../auth/_adapters/auth-register-adapter";
import { readCurrentSessionState } from "../../../auth/_adapters/auth-session-boundary";
import type { LiveWatchGuestAuthActionState } from "../_lib/live-watch-guest-auth-action-state";

const LIVE_WATCH_GUEST_SIGN_IN_UNAVAILABLE_MESSAGE =
  "Giriş şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene.";
const LIVE_WATCH_GUEST_REGISTER_UNAVAILABLE_MESSAGE =
  "Kayıt şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene.";
const LIVE_WATCH_GUEST_PUBLISHER_BLOCK_MESSAGE =
  "Bu hesapla yorum yazılamıyor. Yorum için kullanıcı hesabıyla devam et.";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function signInLiveWatchGuestAction(
  _previousState: LiveWatchGuestAuthActionState,
  formData: FormData
): Promise<LiveWatchGuestAuthActionState> {
  try {
    const result = await signInWithPassword({
      identifier: getFormValue(formData, "identifier"),
      password: getFormValue(formData, "password")
    });

    if (!result.ok) {
      return {
        status: "error",
        message: result.message
      };
    }

    const sessionState = await readCurrentSessionState();

    if (sessionState.kind !== "authenticated") {
      return {
        status: "error",
        message: LIVE_WATCH_GUEST_SIGN_IN_UNAVAILABLE_MESSAGE
      };
    }

    if (
      sessionState.session.roleType === "user" ||
      sessionState.session.roleType === "admin"
    ) {
      return {
        status: "success"
      };
    }

    if (sessionState.session.roleType === "publisher") {
      return {
        status: "error",
        message: LIVE_WATCH_GUEST_PUBLISHER_BLOCK_MESSAGE
      };
    }

    return {
      status: "error",
      message: LIVE_WATCH_GUEST_SIGN_IN_UNAVAILABLE_MESSAGE
    };
  } catch {
    return {
      status: "error",
      message: LIVE_WATCH_GUEST_SIGN_IN_UNAVAILABLE_MESSAGE
    };
  }
}

export async function registerLiveWatchGuestUserAction(
  _previousState: LiveWatchGuestAuthActionState,
  formData: FormData
): Promise<LiveWatchGuestAuthActionState> {
  try {
    const result = await registerUserAccount({
      email: getFormValue(formData, "email"),
      username: getFormValue(formData, "username"),
      password: getFormValue(formData, "password")
    });

    if (!result.ok) {
      return {
        status: "error",
        message: result.message
      };
    }

    const sessionState = await readCurrentSessionState();

    if (
      sessionState.kind === "authenticated" &&
      sessionState.session.roleType === "user"
    ) {
      return {
        status: "success"
      };
    }

    return {
      status: "error",
      message: LIVE_WATCH_GUEST_REGISTER_UNAVAILABLE_MESSAGE
    };
  } catch {
    return {
      status: "error",
      message: LIVE_WATCH_GUEST_REGISTER_UNAVAILABLE_MESSAGE
    };
  }
}
