"use client";

import type { StudioPreviewState } from "../../_adapters/studio-preview-adapter";
import { STUDIO_COPY } from "../../_lib/studio-copy";
import { StudioPermissionNotice } from "../StudioPermissionNotice";
import styles from "../studio-preview-panel.module.css";

type StudioPreviewSupportStackProps = Readonly<{
  canRetry: boolean;
  onRetryPreview: () => void;
  previewState: StudioPreviewState;
}>;

export function StudioPreviewSupportStack({
  canRetry,
  onRetryPreview,
  previewState
}: StudioPreviewSupportStackProps) {
  return (
    <div className={styles.sceneSupportStack}>
      <StudioPermissionNotice state={previewState} />

      {canRetry ? (
        <button
          className={`${styles.stackAction} ui-action ui-action-secondary`}
          onClick={onRetryPreview}
          type="button"
        >
          {STUDIO_COPY.retryPreviewLabel}
        </button>
      ) : null}
    </div>
  );
}
