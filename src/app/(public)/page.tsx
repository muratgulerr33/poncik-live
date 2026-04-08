import { Suspense } from "react";

import { DiscoveryLoadingState } from "./_components/discovery-state";
import { DiscoveryShell } from "./_components/discovery-shell";
import { DiscoveryController } from "./_controllers/discovery-controller";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <DiscoveryShell>
          <DiscoveryLoadingState />
        </DiscoveryShell>
      }
    >
      <DiscoveryController />
    </Suspense>
  );
}
