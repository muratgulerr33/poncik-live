import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";

export function PublisherApprovedSurface() {
  return (
    <AuthNotice
      title={AUTH_COPY.publisherApprovedTitle}
      body={AUTH_COPY.publisherApprovedBody}
      tone="info"
    />
  );
}
