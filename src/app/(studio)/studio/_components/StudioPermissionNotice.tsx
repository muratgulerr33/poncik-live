import { type StudioPreviewState } from "../_adapters/studio-preview-adapter";
import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio-permission-notice.module.css";

type StudioPermissionNoticeProps = {
  state: StudioPreviewState;
};

function getCapabilityCopy(state: StudioPreviewState) {
  if (state === "requesting") {
    return {
      title: STUDIO_COPY.requestingTitle,
      body: STUDIO_COPY.requestingBody
    };
  }

  if (state === "preview_ready") {
    return {
      title: STUDIO_COPY.previewReadyTitle,
      body: STUDIO_COPY.previewReadyBody
    };
  }

  if (state === "blocked") {
    return {
      title: STUDIO_COPY.blockedTitle,
      body: STUDIO_COPY.blockedBody
    };
  }

  if (state === "unsupported") {
    return {
      title: STUDIO_COPY.unsupportedTitle,
      body: STUDIO_COPY.unsupportedBody
    };
  }

  if (state === "timeout") {
    return {
      title: STUDIO_COPY.timeoutTitle,
      body: STUDIO_COPY.timeoutBody
    };
  }

  return {
    title: STUDIO_COPY.capabilityDegradedTitle,
    body: STUDIO_COPY.capabilityDegradedBody
  };
}

export function StudioPermissionNotice({ state }: StudioPermissionNoticeProps) {
  const copy = getCapabilityCopy(state);

  return (
    <section className={styles.notice} data-state={state}>
      <h3 className={styles.noticeTitle}>{copy.title}</h3>
      <p className={styles.noticeBody}>{copy.body}</p>
    </section>
  );
}
