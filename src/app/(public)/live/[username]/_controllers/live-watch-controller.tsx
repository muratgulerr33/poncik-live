import { readWatchView } from "@/app/(public)/_lib/public-live-read";

import { LiveWatchFreshness } from "../_components/live-watch-freshness";
import { LiveWatchEndedRedirectOwner } from "../_components/LiveWatchEndedRedirectOwner";
import { LiveWatchShell } from "../_components/live-watch-shell";
import {
  LiveEndedState,
  LiveUnavailableState
} from "../_components/live-watch-state";
import { LiveWatchPlaybackController } from "./LiveWatchPlaybackController";
import type { LiveWatchChatAccess } from "./LiveWatchChatController";
import { readLiveWatchViewerWriteAccess } from "../_lib/live-watch-viewer-write-access";

type LiveWatchControllerProps = Readonly<{
  username: string;
}>;

export async function LiveWatchController({
  username
}: LiveWatchControllerProps) {
  const [viewerWriteAccess, view] = await Promise.all([
    readLiveWatchViewerWriteAccess(),
    readWatchView(username)
  ]);

  const chatAccess: LiveWatchChatAccess =
    viewerWriteAccess.kind === "guest_read_only"
      ? {
      kind: "guest"
        }
      : viewerWriteAccess.kind === "viewer_write_allowed"
        ? {
            kind: "viewer_ready",
            viewerUsername: viewerWriteAccess.username
          }
        : viewerWriteAccess.kind === "viewer_write_role_blocked"
          ? {
              kind: "viewer_role_blocked"
            }
          : viewerWriteAccess.kind === "viewer_write_username_blocked"
            ? {
                kind: "viewer_username_blocked"
              }
            : {
                kind: "auth_state_blocked"
              };

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
        <LiveEndedState />
        <LiveWatchEndedRedirectOwner />
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
