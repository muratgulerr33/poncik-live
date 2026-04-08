import { readPublisherApplicationStatus } from "../_adapters/auth-publisher-application-boundary";
import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { resolveAuthContinuation } from "../_lib/auth-continuation";
import { AUTH_COPY } from "../_lib/auth-copy";

type AuthCoreControllerInput = Readonly<{
  next: string | null | undefined;
  registered: string | null | undefined;
}>;

export async function getAuthCoreView(input: AuthCoreControllerInput) {
  const sessionState = await readCurrentSession();
  const continuation = resolveAuthContinuation(input.next);
  const currentSession =
    sessionState.kind === "authenticated" ? sessionState.session : null;
  let publisherNotice: {
    title: string;
    body: string;
  } | null = null;

  if (currentSession?.roleType === "publisher" && input.registered === "publisher") {
    const applicationState = await readPublisherApplicationStatus(currentSession.accountId);

    publisherNotice =
      applicationState.kind === "found" && applicationState.status === "pending_review"
        ? {
            title: AUTH_COPY.publisherPendingTitle,
            body: AUTH_COPY.publisherPendingBody
          }
        : {
            title: AUTH_COPY.publisherPendingFallbackTitle,
            body: AUTH_COPY.publisherPendingFallbackBody
          };
  }

  return {
    currentSession,
    degradedMessage:
      sessionState.kind === "degraded"
        ? "Giriş işlemleri şu anda tamamlanamıyor. Lütfen biraz sonra tekrar dene."
        : null,
    continuation,
    publisherNotice
  };
}
