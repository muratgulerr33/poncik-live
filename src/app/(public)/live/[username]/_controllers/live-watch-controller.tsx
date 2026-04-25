import { readWatchView } from "@/app/(public)/_lib/public-live-read";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

import { LiveWatchFreshness } from "../_components/live-watch-freshness";
import { LiveWatchShell } from "../_components/live-watch-shell";
import {
  LiveEndedState,
  LiveUnavailableState
} from "../_components/live-watch-state";
import { LiveWatchPlaybackController } from "./LiveWatchPlaybackController";
import type { LiveWatchChatAccess } from "./LiveWatchChatController";

type LiveWatchControllerProps = Readonly<{
  username: string;
}>;

export async function LiveWatchController({
  username
}: LiveWatchControllerProps) {
  const [sessionState, view] = await Promise.all([
    readCurrentSessionState(),
    readWatchView(username)
  ]);

  let chatAccess: LiveWatchChatAccess = {
    kind: "auth_state_blocked"
  };

  if (sessionState.kind === "anonymous") {
    chatAccess = {
      kind: "guest"
    };
  }

  if (sessionState.kind === "authenticated") {
    const viewerUsername = sessionState.session.username.trim();

    if (viewerUsername.length > 0) {
      chatAccess = {
        kind: "viewer_ready",
        viewerUsername
      };
    } else {
      chatAccess = {
        kind: "viewer_username_blocked"
      };
    }
  }

  if (view.kind === "live") {
    return (
      <LiveWatchShell audioToggleEnabled username={view.username}>
        <LiveWatchPlaybackController chatAccess={chatAccess} username={view.username} />
        <LiveWatchFreshness mode="live" />
      </LiveWatchShell>
    );
  }

  if (view.kind === "ended") {
    return (
      <LiveWatchShell audioToggleEnabled={false} username={view.username}>
        <LiveEndedState username={view.username} />
        <LiveWatchFreshness mode="non_live" />
      </LiveWatchShell>
    );
  }

  return (
    <LiveWatchShell audioToggleEnabled={false} username={view.username}>
      <LiveUnavailableState username={view.username} />
      <LiveWatchFreshness mode="non_live" />
    </LiveWatchShell>
  );
}
