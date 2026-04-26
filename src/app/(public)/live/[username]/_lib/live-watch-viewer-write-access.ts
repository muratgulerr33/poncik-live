import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

export type LiveWatchViewerWriteAccess =
  | {
      kind: "guest_read_only";
    }
  | {
      kind: "viewer_write_allowed";
      accountId: string;
      username: string;
    }
  | {
      kind: "viewer_write_role_blocked";
    }
  | {
      kind: "viewer_write_username_blocked";
    }
  | {
      kind: "viewer_write_degraded_read_only";
    };

export async function readLiveWatchViewerWriteAccess(): Promise<LiveWatchViewerWriteAccess> {
  const sessionState = await readCurrentSessionState();

  if (sessionState.kind === "anonymous") {
    return {
      kind: "guest_read_only"
    };
  }

  if (sessionState.kind === "degraded") {
    return {
      kind: "viewer_write_degraded_read_only"
    };
  }

  const viewerUsername = sessionState.session.username.trim();

  if (!viewerUsername) {
    return {
      kind: "viewer_write_username_blocked"
    };
  }

  const canWriteFromLiveWatch =
    sessionState.session.roleType === "user" ||
    sessionState.session.roleType === "admin";

  if (!canWriteFromLiveWatch) {
    return {
      kind: "viewer_write_role_blocked"
    };
  }

  return {
    kind: "viewer_write_allowed",
    accountId: sessionState.session.accountId,
    username: viewerUsername
  };
}
