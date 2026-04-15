"use client";

import Image from "next/image";
import { useActionState } from "react";

import { selectPublisherCoverAction } from "../_actions/cover-selection-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type PublisherCoverOptionCardProps = Readonly<{
  item: {
    id: string;
    previewSrc: string;
    label: string;
    isSelected: boolean;
  };
}>;

export function PublisherCoverOptionCard({
  item
}: PublisherCoverOptionCardProps) {
  const [state, formAction, isPending] = useActionState(
    selectPublisherCoverAction.bind(null, item.id),
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <article
      className={`${styles.coverCard} ${
        item.isSelected ? styles.coverCardSelected : ""
      }`.trim()}
    >
      <div className={styles.coverPreviewFrame}>
        <Image
          src={item.previewSrc}
          alt={`${item.label} önizleme`}
          width={320}
          height={180}
          className={styles.coverPreview}
        />
      </div>

      <div className={styles.coverCardHeader}>
        <p className={`t-label ${styles.noticeTitle}`}>{item.label}</p>
        {item.isSelected ? (
          <span className={`t-caption ${styles.coverSelectedBadge}`}>
            {AUTH_COPY.publisherCoverSelectedLabel}
          </span>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <AuthNotice
          title={AUTH_COPY.publisherCoverSaveErrorTitle}
          body={state.message}
          tone="error"
        />
      ) : null}

      <div className={styles.coverCardActions}>
        {item.isSelected ? (
          <p className={`t-caption ${styles.coverSelectedHelper}`}>
            {AUTH_COPY.publisherCoverSelectedBody}
          </p>
        ) : (
          <form action={formAction} className={styles.coverCardForm}>
            <button
              type="submit"
              className="ui-action ui-action-secondary"
              disabled={isPending}
            >
              {isPending
                ? AUTH_COPY.publisherCoverChoosePendingLabel
                : AUTH_COPY.publisherCoverChooseLabel}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
