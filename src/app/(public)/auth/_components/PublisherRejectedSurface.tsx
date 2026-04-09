import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import { PublisherSupportSlot } from "./PublisherSupportSlot";

export function PublisherRejectedSurface() {
  return (
    <>
      <AuthNotice
        title={AUTH_COPY.publisherRejectedTitle}
        body={AUTH_COPY.publisherRejectedBody}
        tone="error"
      />
      <PublisherSupportSlot
        title={AUTH_COPY.publisherRejectedSupportTitle}
        body={AUTH_COPY.publisherRejectedSupportBody}
        tone="primary"
      />
    </>
  );
}
