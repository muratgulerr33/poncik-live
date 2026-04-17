import { Suspense } from "react";

import { type DiscoveryRouteMenuItem } from "./_components/discovery-route-shell";
import { DiscoveryRouteShell } from "./_components/discovery-route-shell";
import { DiscoveryLoadingState } from "./_components/discovery-state";
import { DiscoveryController } from "./_controllers/discovery-controller";

export const dynamic = "force-dynamic";

const FALLBACK_MENU_ITEMS: DiscoveryRouteMenuItem[] = [
  {
    type: "link",
    label: "Keşfet",
    href: "/",
    isCurrent: true
  },
  {
    type: "link",
    label: "Giriş yap",
    href: "/auth"
  },
  {
    type: "link",
    label: "Kayıt ol",
    href: "/auth"
  },
  {
    type: "link",
    label: "Sen de yayıncı ol",
    href: "/auth"
  },
  {
    type: "action",
    label: "Canlı Destek",
    actionId: "support"
  }
];

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <DiscoveryRouteShell
          menuItems={FALLBACK_MENU_ITEMS}
          session={{ kind: "anonymous" }}
        >
          <DiscoveryLoadingState />
        </DiscoveryRouteShell>
      }
    >
      <DiscoveryController />
    </Suspense>
  );
}
