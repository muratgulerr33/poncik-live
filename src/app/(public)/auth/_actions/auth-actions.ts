"use server";

import { redirect } from "next/navigation";

import {
  signInWithPassword,
  signOutCurrentSession
} from "../_adapters/auth-session-adapter";
import {
  registerPublisherAccount,
  registerUserAccount
} from "../_adapters/auth-register-adapter";
import { type AuthActionState } from "../_lib/auth-action-state";
import { resolveAuthContinuation } from "../_lib/auth-continuation";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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

    const continuation = resolveAuthContinuation(getFormValue(formData, "next"));
    redirect(continuation.destination);
  } catch {
    return {
      status: "error",
      message: "Giriş şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene."
    };
  }
}

export async function registerUserAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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

    const continuation = resolveAuthContinuation(getFormValue(formData, "next"));
    redirect(continuation.destination);
  } catch {
    return {
      status: "error",
      message: "Kayıt şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene."
    };
  }
}

export async function registerPublisherAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const result = await registerPublisherAccount({
      fullName: getFormValue(formData, "full_name"),
      username: getFormValue(formData, "username"),
      phone: getFormValue(formData, "phone"),
      email: getFormValue(formData, "email"),
      password: getFormValue(formData, "password")
    });

    if (!result.ok) {
      return {
        status: "error",
        message: result.message
      };
    }

    redirect("/auth?registered=publisher");
  } catch {
    return {
      status: "error",
      message: "Başvuru şu anda tamamlanamıyor. Lütfen daha sonra tekrar dene."
    };
  }
}

export async function signOutAction(
  _previousState: AuthActionState
): Promise<AuthActionState> {
  void _previousState;

  try {
    const result = await signOutCurrentSession();

    if (!result.ok) {
      return {
        status: "error",
        message: result.message
      };
    }

    redirect("/");
  } catch {
    return {
      status: "error",
      message: "Çıkış şu anda tamamlanamıyor."
    };
  }
}
