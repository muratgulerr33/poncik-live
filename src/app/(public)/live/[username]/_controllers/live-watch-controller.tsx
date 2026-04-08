import { readWatchView } from "@/app/(public)/_lib/public-live-read";

import { LiveWatchShell } from "../_components/live-watch-shell";
import {
  LiveEndedState,
  LiveUnavailableState,
  LiveWatchFrame
} from "../_components/live-watch-state";

type LiveWatchControllerProps = Readonly<{
  username: string;
}>;

export async function LiveWatchController({
  username
}: LiveWatchControllerProps) {
  const view = await readWatchView(username);

  if (view.kind === "live") {
    return (
      <LiveWatchShell username={view.username}>
        <LiveWatchFrame username={view.username} />
      </LiveWatchShell>
    );
  }

  if (view.kind === "ended") {
    return (
      <LiveWatchShell username={view.username}>
        <LiveEndedState username={view.username} />
      </LiveWatchShell>
    );
  }

  return (
    <LiveWatchShell username={view.username}>
      <LiveUnavailableState username={view.username} />
    </LiveWatchShell>
  );
}
