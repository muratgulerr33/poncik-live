"use server";

import { revalidatePath } from "next/cache";

import { reviewPendingPublisherApplication } from "../_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { type AuthActionState } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

async function reviewPublisherApplication(
  applicationId: string,
  nextStatus: "approved" | "rejected"
): Promise<AuthActionState> {
  try {
    const sessionState = await readCurrentSession();

    if (
      sessionState.kind !== "authenticated" ||
      sessionState.session.roleType !== "admin"
    ) {
      return {
        status: "error",
        message: AUTH_COPY.adminApproveErrorBody
      };
    }

    const updated = await reviewPendingPublisherApplication({
      applicationId,
      reviewerAccountId: sessionState.session.accountId,
      nextStatus
    });

    if (!updated) {
      return {
        status: "error",
        message: AUTH_COPY.adminApproveErrorBody
      };
    }

    revalidatePath("/auth");
    revalidatePath("/studio");

    return {
      status: "idle"
    };
  } catch {
    return {
      status: "error",
      message: AUTH_COPY.adminApproveErrorBody
    };
  }
}

export async function approvePublisherApplicationAction(
  applicationId: string,
  _previousState: AuthActionState
): Promise<AuthActionState> {
  void _previousState;

  return reviewPublisherApplication(applicationId, "approved");
}

export async function rejectPublisherApplicationAction(
  applicationId: string,
  _previousState: AuthActionState
): Promise<AuthActionState> {
  void _previousState;

  return reviewPublisherApplication(applicationId, "rejected");
}
