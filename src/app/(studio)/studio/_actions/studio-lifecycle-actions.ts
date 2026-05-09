"use server";

import { revalidatePath } from "next/cache";

import { getPublicLivePath } from "@/app/(public)/_lib/public-live-path";
import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

import {
  startBroadcastForPublisher
} from "../_adapters/studio-broadcast-adapter";
import { stopCurrentApprovedPublisherBroadcast } from "../_adapters/studio-broadcast-stop-adapter";
import {
  type StudioLifecycleActionState
} from "../_lib/studio-lifecycle-action-state";
import { STUDIO_COPY } from "../_lib/studio-copy";

async function readApprovedPublisherSession() {
  const sessionState = await readCurrentSessionState();

  if (
    sessionState.kind !== "authenticated" ||
    sessionState.session.roleType !== "publisher"
  ) {
    return null;
  }

  const applicationState = await readPublisherApplicationStatus(
    sessionState.session.accountId
  );

  if (applicationState.kind !== "found" || applicationState.status !== "approved") {
    return null;
  }

  return sessionState.session;
}

function revalidateStudioRoutes(username: string) {
  revalidatePath("/studio");
  revalidatePath("/");
  revalidatePath(getPublicLivePath(username));
}

export async function startBroadcastAction(
): Promise<StudioLifecycleActionState> {
  try {
    const session = await readApprovedPublisherSession();

    if (!session) {
      return {
        status: "error",
        message: STUDIO_COPY.startBroadcastError
      };
    }

    await startBroadcastForPublisher(session.accountId);
    revalidateStudioRoutes(session.username);

    return {
      status: "idle"
    };
  } catch {
    return {
      status: "error",
      message: STUDIO_COPY.startBroadcastError
    };
  }
}

export async function stopBroadcastAction(
): Promise<StudioLifecycleActionState> {
  const result = await stopCurrentApprovedPublisherBroadcast();

  if (result.kind === "stopped" || result.kind === "noop") {
    return {
      status: "idle"
    };
  }

  return {
    status: "error",
    message: STUDIO_COPY.stopBroadcastError
  };
}
