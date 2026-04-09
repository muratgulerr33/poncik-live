import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";

type PublisherStatusFallbackProps = Readonly<{
  kind: "missing" | "degraded";
  showContinuityHint: boolean;
}>;

export function PublisherStatusFallback({
  kind,
  showContinuityHint
}: PublisherStatusFallbackProps) {
  const title =
    showContinuityHint && kind === "missing"
      ? AUTH_COPY.publisherPendingContinuityTitle
      : AUTH_COPY.publisherFallbackTitle;

  const body =
    kind === "missing"
      ? AUTH_COPY.publisherMissingBody
      : AUTH_COPY.publisherDegradedBody;

  return <AuthNotice title={title} body={body} tone="info" />;
}
