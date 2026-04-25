import { readWatchView } from "@/app/(public)/_lib/public-live-read";

import { LiveWatchFreshness } from "../_components/live-watch-freshness";
import { LiveWatchShell } from "../_components/live-watch-shell";
import {
  LiveEndedState,
  LiveUnavailableState
} from "../_components/live-watch-state";
import { LiveWatchPlaybackController } from "./LiveWatchPlaybackController";

type LiveWatchControllerProps = Readonly<{
  username: string;
}>;

export async function LiveWatchController({
  username
}: LiveWatchControllerProps) {
  const view = await readWatchView(username);

  if (view.kind === "live") {
    return (
      <LiveWatchShell audioToggleEnabled username={view.username}>
        <LiveWatchPlaybackController username={view.username} />
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
