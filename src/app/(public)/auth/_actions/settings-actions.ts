"use server";

import { redirect } from "next/navigation";

import { type AuthActionState } from "../_lib/auth-action-state";
import { updateCurrentAccountUsername } from "../_adapters/auth-settings-account-boundary";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updateUsernameAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const result = await updateCurrentAccountUsername({
    username: getFormValue(formData, "username")
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message
    };
  }

  redirect("/auth?surface=settings&updated=username");
}
