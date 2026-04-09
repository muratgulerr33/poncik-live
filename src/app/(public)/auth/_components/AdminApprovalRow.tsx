"use client";

import { useActionState } from "react";

import {
  approvePublisherApplicationAction,
  rejectPublisherApplicationAction
} from "../_actions/approval-actions";
import { INITIAL_AUTH_ACTION_STATE } from "../_lib/auth-action-state";
import { AUTH_COPY } from "../_lib/auth-copy";

import { AuthNotice } from "./AuthNotice";
import styles from "./auth.module.css";

type AdminApprovalRowProps = Readonly<{
  item: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    username: string;
    createdAtLabel: string;
  };
}>;

export function AdminApprovalRow({ item }: AdminApprovalRowProps) {
  const [approveState, approveAction, isApproving] = useActionState(
    approvePublisherApplicationAction.bind(null, item.id),
    INITIAL_AUTH_ACTION_STATE
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectPublisherApplicationAction.bind(null, item.id),
    INITIAL_AUTH_ACTION_STATE
  );

  return (
    <div className={styles.notice}>
      <p className={`t-label ${styles.noticeTitle}`}>{item.fullName}</p>
      <p className={`t-body ${styles.noticeBody}`}>@{item.username}</p>
      <p className={`t-caption ${styles.meta}`}>{item.email}</p>
      <p className={`t-caption ${styles.meta}`}>{item.phone}</p>
      <p className={`t-caption ${styles.meta}`}>
        {AUTH_COPY.adminReviewMetaPrefix}: {item.createdAtLabel}
      </p>
      {approveState.status === "error" && approveState.message ? (
        <AuthNotice
          title={AUTH_COPY.adminApproveSuccessLabel}
          body={approveState.message}
          tone="error"
        />
      ) : null}
      {rejectState.status === "error" && rejectState.message ? (
        <AuthNotice
          title={AUTH_COPY.adminApproveSuccessLabel}
          body={rejectState.message}
          tone="error"
        />
      ) : null}
      <div className={styles.actionRow}>
        <form action={approveAction}>
          <button
            type="submit"
            className={styles.action}
            disabled={isApproving || isRejecting}
          >
            {AUTH_COPY.adminApproveLabel}
          </button>
        </form>
        <form action={rejectAction}>
          <button
            type="submit"
            className={styles.secondaryAction}
            disabled={isApproving || isRejecting}
          >
            {AUTH_COPY.adminRejectLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
