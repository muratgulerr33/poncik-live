"use client";

import { useActionState } from "react";

import {
  startBroadcastAction,
  stopBroadcastAction
} from "../_actions/studio-lifecycle-actions";
import {
  INITIAL_STUDIO_LIFECYCLE_ACTION_STATE
} from "../_lib/studio-lifecycle-action-state";
import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio.module.css";

type StudioLifecycleActionsProps = {
  canStart: boolean;
  canStop: boolean;
};

export function StudioLifecycleActions({
  canStart,
  canStop
}: StudioLifecycleActionsProps) {
  const [startState, startAction, isStarting] = useActionState(
    startBroadcastAction,
    INITIAL_STUDIO_LIFECYCLE_ACTION_STATE
  );
  const [stopState, stopAction, isStopping] = useActionState(
    stopBroadcastAction,
    INITIAL_STUDIO_LIFECYCLE_ACTION_STATE
  );

  const isPending = isStarting || isStopping;
  const message =
    startState.status === "error"
      ? startState.message
      : stopState.status === "error"
        ? stopState.message
        : null;

  return (
    <div className={styles.lifecycleStack}>
      <div className={styles.actionRow}>
        <form action={startAction}>
          <button
            className={styles.primaryAction}
            disabled={!canStart || isPending}
            type="submit"
          >
            {isStarting ? STUDIO_COPY.startingBroadcastLabel : STUDIO_COPY.startBroadcastLabel}
          </button>
        </form>

        <form action={stopAction}>
          <button
            className={styles.secondaryAction}
            disabled={!canStop || isPending}
            type="submit"
          >
            {isStopping ? STUDIO_COPY.stoppingBroadcastLabel : STUDIO_COPY.stopBroadcastLabel}
          </button>
        </form>
      </div>

      {message ? <p className={styles.errorText}>{message}</p> : null}
    </div>
  );
}
