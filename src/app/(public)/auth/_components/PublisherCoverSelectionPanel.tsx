import { type PublisherCoverCatalogState } from "../_controllers/auth-surface-view";
import { AUTH_COPY } from "../_lib/auth-copy";

import { PublisherCoverOptionCard } from "./PublisherCoverOptionCard";
import styles from "./auth.module.css";

type PublisherCoverSelectionPanelProps = Readonly<{
  coverCatalogState: PublisherCoverCatalogState;
}>;

export function PublisherCoverSelectionPanel({
  coverCatalogState
}: PublisherCoverSelectionPanelProps) {
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

      {coverCatalogState.kind === "empty-selected" ? (
        <p className={`t-caption ${styles.coverHelper}`}>
          {AUTH_COPY.publisherCoverEmptySelectedBody}
        </p>
      ) : null}

      <div className={styles.coverGrid}>
        {coverCatalogState.items.map((item) => (
          <PublisherCoverOptionCard
            key={item.id}
            item={{
              id: item.id,
              previewSrc: item.previewSrc,
              label: item.label,
              isSelected: item.isSelected
            }}
          />
        ))}
      </div>
    </section>
  );
}
