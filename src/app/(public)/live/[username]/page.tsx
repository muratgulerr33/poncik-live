import { Suspense } from "react";

import { LiveWatchController } from "./_controllers/live-watch-controller";
import { LiveWatchShell } from "./_components/live-watch-shell";
import { LiveWatchLoadingState } from "./_components/live-watch-state";

type LivePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LivePage({ params }: LivePageProps) {
  const { username } = await params;

  return (
    <Suspense
      fallback={
        <LiveWatchShell
          audioToggleEnabled={false}
          defaultCoverVisible
          username={username}
        >
          <LiveWatchLoadingState />
        </LiveWatchShell>
      }
    >
      <LiveWatchController username={username} />
    </Suspense>
  );
}
