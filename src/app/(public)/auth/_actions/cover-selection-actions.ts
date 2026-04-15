"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { savePublisherCoverSelection } from "../_adapters/auth-cover-selection-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { type AuthActionState } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

export async function selectPublisherCoverAction(
  coverImageId: string,
  _previousState: AuthActionState
): Promise<AuthActionState> {
  void _previousState;

  try {
    const sessionState = await readCurrentSession();

    if (
      sessionState.kind !== "authenticated" ||
      sessionState.session.roleType !== "publisher"
    ) {
      return {
        status: "error",
        message: AUTH_COPY.publisherCoverUnauthorizedBody
      };
    }

    const result = await savePublisherCoverSelection({
      accountId: sessionState.session.accountId,
      coverImageId
    });

    if (!result.ok) {
      return {
        status: "error",
        message:
          result.reason === "invalid-cover"
            ? AUTH_COPY.publisherCoverInvalidBody
            : result.reason === "data-anomaly"
              ? AUTH_COPY.publisherCoverDataAnomalyBody
              : AUTH_COPY.publisherCoverUnavailableBody
      };
    }

    revalidatePath("/auth");
    redirect("/auth");
  } catch {
    return {
      status: "error",
      message: AUTH_COPY.publisherCoverUnavailableBody
    };
  }
}
