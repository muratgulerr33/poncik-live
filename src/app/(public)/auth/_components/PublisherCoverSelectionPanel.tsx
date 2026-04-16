"use client";

import Image from "next/image";
import { useState } from "react";

import { type PublisherCoverCatalogState } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { PublisherCoverSheet } from "./PublisherCoverSheet";
import styles from "./auth.module.css";

type PublisherCoverSelectionPanelProps = Readonly<{
  coverCatalogState: PublisherCoverCatalogState;
}>;

export function PublisherCoverSelectionPanel({
  coverCatalogState
}: PublisherCoverSelectionPanelProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (coverCatalogState.kind === "degraded") {
    return (
      <div className={styles.utilityBlock}>
        <p className={`t-caption ${styles.utilityTitle}`}>
          {AUTH_COPY.publisherCoverDegradedTitle}
        </p>
        <p className={`t-caption ${styles.utilityBody}`}>
          {AUTH_COPY.publisherCoverDegradedBody}
        </p>
      </div>
    );
  }

  const selectedItem =
    coverCatalogState.items.find((item) => item.isSelected) ?? null;

  return (
    <section className={styles.coverPanel}>
      <div className={styles.coverPanelHeader}>
        <h3 className={`t-h3 ${styles.coverPanelTitle}`}>
          {AUTH_COPY.publisherCoverPanelTitle}
        </h3>
        <p className={`t-body ${styles.coverPanelDescription}`}>
          {AUTH_COPY.publisherCoverPanelDescription}
        </p>
      </div>

      <div className={styles.coverSummaryRow}>
        {selectedItem ? (
          <>
            <div className={styles.coverSummaryPreviewFrame}>
              <Image
                src={selectedItem.previewSrc}
                alt={`${selectedItem.label} önizleme`}
                width={112}
                height={64}
                className={styles.coverSummaryPreview}
              />
            </div>
            <div className={styles.coverSummaryContent}>
              <p className={`t-label ${styles.coverSummaryTitle}`}>
                {selectedItem.label}
              </p>
              <p className={`t-caption ${styles.coverSummaryBody}`}>
                {AUTH_COPY.publisherCoverSelectedBody}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.coverSummaryContent}>
            <p className={`t-label ${styles.coverSummaryTitle}`}>
              {AUTH_COPY.publisherCoverEmptySelectedTitle}
            </p>
            <p className={`t-caption ${styles.coverSummaryBody}`}>
              {AUTH_COPY.publisherCoverEmptySelectedBody}
            </p>
          </div>
        )}
      </div>

      <div className={styles.coverPanelActions}>
        <button
          type="button"
          className="ui-action ui-action-secondary"
          onClick={() => setIsSheetOpen(true)}
        >
          {AUTH_COPY.publisherCoverOpenSheetLabel}
        </button>
      </div>

      {isSheetOpen ? (
        <PublisherCoverSheet
          items={coverCatalogState.items}
          onClose={() => setIsSheetOpen(false)}
        />
      ) : null}
    </section>
  );
}
