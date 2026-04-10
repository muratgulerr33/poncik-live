"use server";

import { revalidatePath } from "next/cache";

import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

import {
  startBroadcastForPublisher,
  stopBroadcastForPublisher
} from "../_adapters/studio-broadcast-adapter";
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
  revalidatePath(`/live/${username}`);
}

export async function startBroadcastAction(
  _previousState: StudioLifecycleActionState
): Promise<StudioLifecycleActionState> {
  void _previousState;

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
  _previousState: StudioLifecycleActionState
): Promise<StudioLifecycleActionState> {
  void _previousState;

  try {
    const session = await readApprovedPublisherSession();

    if (!session) {
      return {
        status: "error",
        message: STUDIO_COPY.stopBroadcastError
      };
    }

    await stopBroadcastForPublisher(session.accountId);
    revalidateStudioRoutes(session.username);

    return {
      status: "idle"
    };
  } catch {
    return {
      status: "error",
      message: STUDIO_COPY.stopBroadcastError
    };
  }
}
