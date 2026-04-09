import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import { PublisherSupportSlot } from "./PublisherSupportSlot";

type PublisherPendingSurfaceProps = Readonly<{
  showContinuityHint: boolean;
}>;

export function PublisherPendingSurface({
  showContinuityHint
}: PublisherPendingSurfaceProps) {
  return (
    <>
      <AuthNotice
        title={
          showContinuityHint
            ? AUTH_COPY.publisherPendingContinuityTitle
            : AUTH_COPY.publisherPendingTitle
        }
        body={AUTH_COPY.publisherPendingBody}
        tone="info"
      />
      <PublisherSupportSlot
        title={AUTH_COPY.publisherPendingSupportTitle}
        body={AUTH_COPY.publisherPendingSupportBody}
        tone="secondary"
      />
    </>
  );
}
