import { revalidatePath } from "next/cache";

import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

import { stopBroadcastForPublisher } from "./studio-broadcast-adapter";

type StudioApprovedPublisherStopResult =
  | {
      kind: "stopped" | "noop";
    }
  | {
      kind: "unauthorized" | "degraded";
    };

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

function revalidateStudioLifecyclePaths(username: string) {
  revalidatePath("/studio");
  revalidatePath("/");
  revalidatePath(`/live/${username}`);
}

export async function stopCurrentApprovedPublisherBroadcast(): Promise<StudioApprovedPublisherStopResult> {
  try {
    const session = await readApprovedPublisherSession();

    if (!session) {
      return {
        kind: "unauthorized"
      };
    }

    const stopResult = await stopBroadcastForPublisher(session.accountId);

    revalidateStudioLifecyclePaths(session.username);

    return {
      kind: stopResult.kind === "stopped" ? "stopped" : "noop"
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}
