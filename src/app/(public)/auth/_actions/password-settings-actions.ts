"use server";

import { redirect } from "next/navigation";

import { updateCurrentAccountPassword } from "../_adapters/auth-settings-password-boundary";
import { type AuthActionState } from "../_lib/auth-action-state";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const result = await updateCurrentAccountPassword({
    currentPassword: getFormValue(formData, "current_password"),
    newPassword: getFormValue(formData, "new_password"),
    confirmPassword: getFormValue(formData, "confirm_password")
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message
    };
  }

  redirect("/auth?surface=settings&updated=password");
}
