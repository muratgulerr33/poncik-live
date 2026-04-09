import { readPublisherApplicationStatus } from "../_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { resolveAuthContinuation } from "../_lib/auth-continuation";
import { AUTH_COPY } from "../_lib/auth-copy";

type AuthCoreControllerInput = Readonly<{
  next: string | null | undefined;
  registered: string | null | undefined;
}>;

export type PublisherSurfaceView =
  | {
      kind: "pending_review" | "approved" | "rejected" | "missing" | "degraded";
      showContinuityHint: boolean;
    }
  | null;

export async function getAuthCoreView(input: AuthCoreControllerInput) {
  const sessionState = await readCurrentSession();
  const continuation = resolveAuthContinuation(input.next);
  const currentSession =
    sessionState.kind === "authenticated" ? sessionState.session : null;
  let publisherSurface: PublisherSurfaceView = null;
  let primaryAction: {
    href: string;
    label: string;
  } = {
    href: continuation.destination,
    label: AUTH_COPY.continueLabel
  };

  if (currentSession?.roleType === "publisher") {
    const applicationState = await readPublisherApplicationStatus(currentSession.accountId);
    const showContinuityHint = input.registered === "publisher";

    if (applicationState.kind === "found") {
      if (applicationState.status === "approved") {
        publisherSurface = {
          kind: "approved",
          showContinuityHint: false
        };
        primaryAction = {
          href: "/studio",
          label: AUTH_COPY.goStudioLabel
        };
      } else if (applicationState.status === "rejected") {
        publisherSurface = {
          kind: "rejected",
          showContinuityHint: false
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
    publisherSurface
  };
}
