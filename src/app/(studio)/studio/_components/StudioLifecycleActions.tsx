"use client";

import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio-lifecycle-actions.module.css";

type StudioLifecycleActionsProps = {
  canStart: boolean;
  isStarting: boolean;
  message: string | null;
  onStart: () => void;
  presentation: "scene-native" | "fallback";
};

export function StudioLifecycleActions({
  canStart,
  isStarting,
  message,
  onStart,
  presentation
}: StudioLifecycleActionsProps) {
  const fallbackActionLabel = isStarting
    ? STUDIO_COPY.startingBroadcastLabel
    : STUDIO_COPY.startBroadcastLabel;
  const sceneNativeActionLabel = isStarting
    ? "Canlı Başlıyor"
    : STUDIO_COPY.startBroadcastLabel;
  const isDisabled = !canStart || isStarting;
  const isSceneNative = presentation === "scene-native";

  return (
    <div
      className={
        isSceneNative
          ? `${styles.lifecycleStack} ${styles.sceneNativeStack}`
          : styles.lifecycleStack
      }
    >
      {isSceneNative ? (
        <>
          <button
            aria-busy={isStarting}
            aria-label={sceneNativeActionLabel}
            className={styles.sceneNativeControl}
            data-pending={isStarting ? "true" : undefined}
            disabled={isDisabled}
            onClick={onStart}
            type="button"
          >
            <span
              aria-hidden="true"
              className={styles.sceneNativeControlCore}
              data-pending={isStarting ? "true" : undefined}
            />
          </button>

          <p className={styles.sceneNativeLabel}>{sceneNativeActionLabel}</p>
        </>
      ) : (
        <button
          className={`ui-action ui-action-secondary ${styles.fallbackAction}`}
          disabled={isDisabled}
          onClick={onStart}
          type="button"
        >
          {fallbackActionLabel}
        </button>
      )}

      {message ? (
        <p className={styles.lifecycleMessage}>{message}</p>
      ) : null}
    </div>
  );
}
