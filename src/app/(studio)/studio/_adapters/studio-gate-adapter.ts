import {
  readCurrentSessionState,
  type CurrentSessionReadResult
} from "@/app/(public)/auth/_adapters/auth-session-boundary";
import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";

import { readCurrentActiveBroadcast } from "./studio-broadcast-adapter";
import { type StudioPrepView } from "../_controllers/studio-prep-view";

function mapSessionStateToView(
  sessionState: CurrentSessionReadResult
): StudioPrepView | null {
  if (sessionState.kind === "anonymous") {
    return {
      kind: "redirect_auth"
    };
  }

  if (sessionState.kind === "degraded") {
    return {
      kind: "session_degraded_gate"
    };
  }

  if (sessionState.session.roleType !== "publisher") {
    return {
      kind: "wrong_role",
      roleType: sessionState.session.roleType
    };
  }

  return null;
}

export async function readStudioPrepView(): Promise<StudioPrepView> {
  const sessionState = await readCurrentSessionState();
  const sessionView = mapSessionStateToView(sessionState);

  if (sessionView) {
    return sessionView;
  }

  if (sessionState.kind !== "authenticated") {
    return {
      kind: "session_degraded_gate"
    };
  }

  const session = sessionState.session;
  const applicationState = await readPublisherApplicationStatus(session.accountId);

  if (applicationState.kind !== "found") {
    return {
      kind: "publisher_gate",
      gateKind: "missing_degraded"
    };
  }

  if (applicationState.status === "approved") {
    const broadcastState = await readCurrentActiveBroadcast(session.accountId);

    return {
      kind: "approved_prep",
      session: {
        accountId: session.accountId,
        username: session.username,
        email: session.email
      },
      lifecycle: {
        kind: broadcastState.kind,
        broadcastId:
          broadcastState.kind === "live" ? broadcastState.broadcastId : undefined
      }
    };
  }

  if (applicationState.status === "pending_review") {
    return {
      kind: "publisher_gate",
      gateKind: "pending_review"
    };
  }

  if (applicationState.status === "rejected") {
    return {
      kind: "publisher_gate",
      gateKind: "rejected"
    };
  }

  return {
    kind: "publisher_gate",
    gateKind: "missing_degraded"
  };
}
