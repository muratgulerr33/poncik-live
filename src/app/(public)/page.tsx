import { Suspense } from "react";

import { DiscoveryRouteShell } from "./_components/discovery-route-shell";
import { DiscoveryLoadingState } from "./_components/discovery-state";
import { DiscoveryController } from "./_controllers/discovery-controller";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <DiscoveryRouteShell session={{ kind: "anonymous" }}>
          <DiscoveryLoadingState />
        </DiscoveryRouteShell>
      }
    >
      <DiscoveryController />
    </Suspense>
  );
}
