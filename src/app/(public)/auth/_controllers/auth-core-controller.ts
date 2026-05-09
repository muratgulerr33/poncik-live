import { readPublisherCoverCatalog } from "../_adapters/auth-cover-selection-boundary";
import {
  readPublisherApplicationStatus,
  readPublisherApplicationsByStatus
} from "../_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { resolveAuthContinuation } from "../_lib/auth-continuation";
import { AUTH_COPY } from "../_lib/auth-copy";
import {
  type AdminApprovalStatusFilter,
  type AuthSelectedSurface,
  type AdminSurfaceView,
  type PublisherSurfaceView
} from "./auth-surface-view";

type AuthCoreControllerInput = Readonly<{
  next: string | null | undefined;
  registered: string | null | undefined;
  status: string | null | undefined;
  surface: string | null | undefined;
}>;

function normalizeAdminStatusFilter(
  status: string | null | undefined
): AdminApprovalStatusFilter {
  if (
    status === "pending_review" ||
    status === "approved" ||
    status === "rejected" ||
    status === "all"
  ) {
    return status;
  }

  return "pending_review";
}

function normalizeSelectedSurface(
  surface: string | null | undefined
): AuthSelectedSurface {
  if (surface === "settings") {
    return "settings";
  }

  return "account";
}

export async function getAuthCoreView(input: AuthCoreControllerInput) {
  const sessionState = await readCurrentSession();
  const continuation = resolveAuthContinuation(input.next);
  const currentSession =
    sessionState.kind === "authenticated" ? sessionState.session : null;
  const selectedAdminFilter = normalizeAdminStatusFilter(input.status);
  const requestedSurface = normalizeSelectedSurface(input.surface);
  let publisherSurface: PublisherSurfaceView = null;
  let adminSurface: AdminSurfaceView = null;
  let selectedSurface: AuthSelectedSurface = "account";
  let primaryAction: {
    href: string;
    label: string;
  } = {
    href: continuation.destination,
    label: AUTH_COPY.continueLabel
  };

  if (currentSession?.roleType === "admin") {
    const filteredQueue = await readPublisherApplicationsByStatus(selectedAdminFilter);

    if (filteredQueue.kind === "found") {
      adminSurface =
        filteredQueue.items.length > 0
          ? {
              kind: "queue",
              selectedFilter: selectedAdminFilter,
              isReadOnly: selectedAdminFilter !== "pending_review",
              items: filteredQueue.items.map((item) => ({
                ...item,
                createdAtLabel: item.createdAt.toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })
              }))
            }
          : {
              kind: "empty",
              selectedFilter: selectedAdminFilter
            };
    } else {
      adminSurface = {
        kind: "degraded",
        selectedFilter: selectedAdminFilter
      };
    }

    primaryAction = {
      href: "/",
      label: AUTH_COPY.returnDiscoveryLabel
    };
  } else if (currentSession?.roleType === "publisher") {
    selectedSurface = requestedSurface;

    if (selectedSurface === "settings") {
      return {
        selectedSurface,
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
  } else if (currentSession?.roleType === "user") {
    selectedSurface = requestedSurface;
  }

  return {
    selectedSurface,
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
