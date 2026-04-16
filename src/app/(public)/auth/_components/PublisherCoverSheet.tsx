"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { AUTH_COPY } from "../_lib/auth-copy";

import { PublisherCoverOptionCard } from "./PublisherCoverOptionCard";
import styles from "./auth.module.css";

type PublisherCoverSheetProps = Readonly<{
  items: {
    id: string;
    previewSrc: string;
    label: string;
    isSelected: boolean;
  }[];
  onClose: () => void;
}>;

export function PublisherCoverSheet({
  items,
  onClose
}: PublisherCoverSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        className={styles.coverSheetBackdrop}
        aria-label={AUTH_COPY.publisherCoverSheetCloseLabel}
        onClick={onClose}
      />

      <div
        className={styles.coverSheet}
        role="dialog"
        aria-modal="true"
        aria-label={AUTH_COPY.publisherCoverSheetTitle}
      >
        <div className={styles.coverSheetHeader}>
          <div className={styles.coverSheetHeading}>
            <p className={`t-caption ${styles.coverSheetEyebrow}`}>
              {AUTH_COPY.publisherCoverPanelTitle}
            </p>
            <h3 className={`t-h3 ${styles.coverSheetTitle}`}>
              {AUTH_COPY.publisherCoverSheetTitle}
            </h3>
          </div>
          <button
            type="button"
            className={styles.coverSheetClose}
            aria-label={AUTH_COPY.publisherCoverSheetCloseLabel}
            onClick={onClose}
          >
            <X className={styles.controlIcon} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.coverSheetGrid}>
          {items.map((item) => (
            <PublisherCoverOptionCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
