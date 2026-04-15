import { readPublisherCoverCatalog } from "../_adapters/auth-cover-selection-boundary";
import { readPublisherApplicationStatus } from "../_adapters/auth-publisher-application-boundary";
import { readPendingPublisherApplications } from "../_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { resolveAuthContinuation } from "../_lib/auth-continuation";
import { AUTH_COPY } from "../_lib/auth-copy";
import { type AdminSurfaceView, type PublisherSurfaceView } from "./auth-surface-view";

type AuthCoreControllerInput = Readonly<{
  next: string | null | undefined;
  registered: string | null | undefined;
}>;

export async function getAuthCoreView(input: AuthCoreControllerInput) {
  const sessionState = await readCurrentSession();
  const continuation = resolveAuthContinuation(input.next);
  const currentSession =
    sessionState.kind === "authenticated" ? sessionState.session : null;
  let publisherSurface: PublisherSurfaceView = null;
  let adminSurface: AdminSurfaceView = null;
  let primaryAction: {
    href: string;
    label: string;
  } = {
    href: continuation.destination,
    label: AUTH_COPY.continueLabel
  };

  if (currentSession?.roleType === "admin") {
    const pendingQueue = await readPendingPublisherApplications();

    if (pendingQueue.kind === "found") {
      adminSurface =
        pendingQueue.items.length > 0
          ? {
              kind: "queue",
              items: pendingQueue.items.map((item) => ({
                ...item,
                createdAtLabel: item.createdAt.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })
              }))
            }
          : {
              kind: "empty"
            };
    } else {
      adminSurface = {
        kind: "degraded"
      };
    }

    primaryAction = {
      href: "/",
      label: AUTH_COPY.returnDiscoveryLabel
    };
  } else if (currentSession?.roleType === "publisher") {
    const applicationState = await readPublisherApplicationStatus(currentSession.accountId);
    const showContinuityHint = input.registered === "publisher";

    if (applicationState.kind === "found") {
      if (applicationState.status === "approved") {
        const coverCatalogState = await readPublisherCoverCatalog(
          currentSession.accountId
        );

        publisherSurface = {
          kind: "approved",
          selectedCoverImageId:
            coverCatalogState.kind === "degraded"
              ? null
              : coverCatalogState.selectedCoverImageId,
          coverCatalogState:
            coverCatalogState.kind === "degraded"
              ? {
                  kind: "degraded"
                }
              : {
                  kind: coverCatalogState.kind,
                  items: coverCatalogState.items.map((item) => ({
                    ...item,
                    isSelected: item.id === coverCatalogState.selectedCoverImageId
                  }))
                }
        };
        primaryAction = {
          href: "/studio",
          label: AUTH_COPY.goStudioLabel
        };
      } else if (applicationState.status === "rejected") {
        publisherSurface = {
          kind: "rejected"
        };
        primaryAction = {
          href: "/",
          label: AUTH_COPY.returnDiscoveryLabel
        };
      } else if (applicationState.status === "pending_review") {
        publisherSurface = {
          kind: "pending_review",
          showContinuityHint
        };
        primaryAction = {
          href: "/",
          label: AUTH_COPY.returnDiscoveryLabel
        };
      } else {
        publisherSurface = {
          kind: "degraded",
          showContinuityHint
        };
        primaryAction = {
          href: "/",
          label: AUTH_COPY.returnDiscoveryLabel
        };
      }
    } else {
      publisherSurface = {
        kind: applicationState.kind,
        showContinuityHint
      };
      primaryAction = {
        href: "/",
        label: AUTH_COPY.returnDiscoveryLabel
      };
    }
  }

  return {
    currentSession,
    degradedMessage:
      sessionState.kind === "degraded"
        ? "Giriş işlemleri şu anda tamamlanamıyor. Lütfen biraz sonra tekrar dene."
        : null,
    continuation,
    primaryAction,
    adminSurface,
    publisherSurface
  };
}
