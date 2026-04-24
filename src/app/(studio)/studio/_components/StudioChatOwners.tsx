"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./studio-chat-owners.module.css";

type StudioChatOwnersProps = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStarting: boolean;
  isStopping: boolean;
}>;

type ChatOwnerPhase = "hidden" | "live" | "exiting";

const CHAT_OWNER_EXIT_DURATION_MS = 220;

function clearExitTimeout(timeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>) {
  if (!timeoutRef.current) {
    return;
  }

  clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}

export function StudioChatOwners({
  effectiveLifecycleKind,
  isStarting,
  isStopping
}: StudioChatOwnersProps) {
  const [phase, setPhase] = useState<ChatOwnerPhase>("hidden");
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingExitRef = useRef(false);
  const hasBeenLiveRef = useRef(false);
  const isLive = effectiveLifecycleKind === "live";
  const isActive = phase === "live";

  const schedulePhaseUpdate = (nextPhase: ChatOwnerPhase) => {
    clearExitTimeout(phaseSyncTimeoutRef);
    phaseSyncTimeoutRef.current = setTimeout(() => {
      phaseSyncTimeoutRef.current = null;
      setPhase((currentPhase) =>
        currentPhase === nextPhase ? currentPhase : nextPhase
      );
    }, 0);
  };

  useEffect(() => {
    return () => {
      clearExitTimeout(exitTimeoutRef);
      clearExitTimeout(phaseSyncTimeoutRef);
    };
  }, []);

  useEffect(() => {
    if (isLive && !isStopping) {
      clearExitTimeout(exitTimeoutRef);
      clearExitTimeout(phaseSyncTimeoutRef);
      hasPendingExitRef.current = false;
      hasBeenLiveRef.current = true;
      schedulePhaseUpdate("live");
      return;
    }

    if (isStarting) {
      clearExitTimeout(exitTimeoutRef);
      clearExitTimeout(phaseSyncTimeoutRef);
      hasPendingExitRef.current = false;
      hasBeenLiveRef.current = false;
      schedulePhaseUpdate("hidden");
      return;
    }

    if (isStopping || hasBeenLiveRef.current) {
      if (hasPendingExitRef.current) {
        return;
      }

      clearExitTimeout(exitTimeoutRef);
      hasPendingExitRef.current = true;
      hasBeenLiveRef.current = false;
      schedulePhaseUpdate("exiting");
      exitTimeoutRef.current = setTimeout(() => {
        hasPendingExitRef.current = false;
        exitTimeoutRef.current = null;
        setPhase("hidden");
      }, CHAT_OWNER_EXIT_DURATION_MS);
      return;
    }

    clearExitTimeout(exitTimeoutRef);
    clearExitTimeout(phaseSyncTimeoutRef);
    hasPendingExitRef.current = false;
    schedulePhaseUpdate("hidden");
  }, [isLive, isStarting, isStopping]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div className={styles.chatLayer} data-phase={phase}>
      <section
        aria-label="Sohbet mesaj katmani"
        className={styles.overlayOwner}
        data-active={isActive ? "true" : "false"}
        data-owner="message-overlay"
      >
        <p className={styles.overlayEyebrow}>Sohbet</p>
        <div className={styles.overlayStack}>
          <article className={styles.overlayBubble} data-tone="primary">
            <p className={styles.overlayAuthor}>Yayin akisi</p>
            <p className={styles.overlayBody}>Mesajlar canli yayin boyunca burada gorunur.</p>
          </article>
          <article className={styles.overlayBubble} data-tone="secondary">
            <p className={styles.overlayAuthor}>Hazir gorunum</p>
            <p className={styles.overlayBody}>Mesaj katmani yalniz canli durumda acik kalir.</p>
          </article>
        </div>
      </section>

      <section
        aria-label="Sohbet yazma alani"
        className={styles.composerOwner}
        data-active={isActive ? "true" : "false"}
        data-owner="composer-dock"
      >
        <div className={styles.composerHeader}>
          <p className={styles.composerTitle}>Canli sohbet</p>
          <span className={styles.composerStatus}>{isActive ? "Hazir" : "Kapaniyor"}</span>
        </div>
        <label className={styles.composerField}>
          <span className={styles.composerLabel}>Mesaj yaz</span>
          <textarea
            className={styles.composerTextarea}
            disabled={!isActive}
            placeholder="Canliyken sohbet yazma alani burada yer alir."
            rows={3}
          />
        </label>
      </section>
    </div>
  );
}
