"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

import type { StudioPreviewState } from "../_adapters/studio-preview-adapter";
import {
  clearStudioRefreshContinuityMarker,
  isFreshStudioRefreshContinuityMarker,
  readStudioRefreshContinuityMarker,
  readStudioRefreshContinuityNavigationType,
  writeStudioRefreshContinuityMarker
} from "../_adapters/studio-refresh-continuity-adapter";

type StudioLifecycleKind = "idle" | "live" | "degraded";

type UseStudioPublishContinuityArgs = {
  lifecycleKind: StudioLifecycleKind;
  previewState: StudioPreviewState;
  isLocallyLiveRef: MutableRefObject<boolean>;
  isStoppingRef: MutableRefObject<boolean>;
  onRecoverContinuity: () => Promise<void>;
  onReconcileFailedRecovery: () => Promise<void>;
};

function isReloadContinuityEligible(lifecycleKind: StudioLifecycleKind) {
  const continuityMarker = readStudioRefreshContinuityMarker();

  if (!continuityMarker) {
    return null;
  }

  if (
    window.location.pathname !== "/studio" ||
    readStudioRefreshContinuityNavigationType() !== "reload"
  ) {
    clearStudioRefreshContinuityMarker();
    return null;
  }

  if (
    !isFreshStudioRefreshContinuityMarker(continuityMarker) ||
    lifecycleKind !== "live"
  ) {
    clearStudioRefreshContinuityMarker();
    return null;
  }

  return continuityMarker;
}

export function useStudioPublishContinuity({
  lifecycleKind,
  previewState,
  isLocallyLiveRef,
  isStoppingRef,
  onRecoverContinuity,
  onReconcileFailedRecovery
}: UseStudioPublishContinuityArgs) {
  const continuityMarkerTimestampRef = useRef<number | null>(null);
  const hasAttemptedContinuityRecoveryRef = useRef(false);
  const hasInitializedContinuityRecoveryRef = useRef(false);
  const hasReconciledFailedRecoveryRef = useRef(false);
  const isMountedRef = useRef(false);
  const refreshContinuityIntentRef = useRef(false);
  const [isRecoveringContinuity, setIsRecoveringContinuity] = useState(false);

  const finishRefreshContinuityAttempt = useCallback(() => {
    if (
      !refreshContinuityIntentRef.current &&
      continuityMarkerTimestampRef.current === null &&
      !isRecoveringContinuity
    ) {
      return;
    }

    clearStudioRefreshContinuityMarker();
    continuityMarkerTimestampRef.current = null;
    hasAttemptedContinuityRecoveryRef.current = false;
    hasReconciledFailedRecoveryRef.current = false;
    refreshContinuityIntentRef.current = false;

    if (isMountedRef.current) {
      setIsRecoveringContinuity(false);
    }
  }, [isRecoveringContinuity]);

  const handlePageHideForRefreshContinuity = useCallback(() => {
    if (
      !isLocallyLiveRef.current ||
      isStoppingRef.current ||
      lifecycleKind !== "live"
    ) {
      return;
    }

    writeStudioRefreshContinuityMarker();
    refreshContinuityIntentRef.current = true;
  }, [isLocallyLiveRef, isStoppingRef, lifecycleKind]);

  const shouldBypassCloseStopForRefresh = useCallback(() => {
    return refreshContinuityIntentRef.current;
  }, []);

  const reconcileFailedRecoveryOnce = useCallback(async () => {
    if (hasReconciledFailedRecoveryRef.current) {
      return;
    }

    hasReconciledFailedRecoveryRef.current = true;
    await onReconcileFailedRecovery();
  }, [onReconcileFailedRecovery]);

  const maybeStartRefreshContinuityRecovery = useCallback(async () => {
    if (!isRecoveringContinuity) {
      return;
    }

    const continuityMarkerTimestamp = continuityMarkerTimestampRef.current;

    if (
      !continuityMarkerTimestamp ||
      !isFreshStudioRefreshContinuityMarker({
        path: "/studio",
        timestamp: continuityMarkerTimestamp
      })
    ) {
      await reconcileFailedRecoveryOnce();
      return;
    }

    if (lifecycleKind !== "live") {
      finishRefreshContinuityAttempt();
      return;
    }

    if (previewState === "preview_ready") {
      if (hasAttemptedContinuityRecoveryRef.current) {
        return;
      }

      hasAttemptedContinuityRecoveryRef.current = true;
      await onRecoverContinuity();
      return;
    }

    if (previewState !== "requesting") {
      await reconcileFailedRecoveryOnce();
    }
  }, [
    finishRefreshContinuityAttempt,
    isRecoveringContinuity,
    lifecycleKind,
    onRecoverContinuity,
    previewState,
    reconcileFailedRecoveryOnce
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (hasInitializedContinuityRecoveryRef.current) {
      return;
    }

    hasInitializedContinuityRecoveryRef.current = true;

    const continuityMarker = isReloadContinuityEligible(lifecycleKind);

    if (!continuityMarker) {
      return;
    }

    continuityMarkerTimestampRef.current = continuityMarker.timestamp;
    hasAttemptedContinuityRecoveryRef.current = false;
    hasReconciledFailedRecoveryRef.current = false;
    refreshContinuityIntentRef.current = true;

    const bootstrapRecoveryTimeout = window.setTimeout(() => {
      setIsRecoveringContinuity(true);
    }, 0);

    return () => {
      window.clearTimeout(bootstrapRecoveryTimeout);
    };
  }, [lifecycleKind]);

  return {
    finishRefreshContinuityAttempt,
    handlePageHideForRefreshContinuity,
    isRecoveringContinuity,
    maybeStartRefreshContinuityRecovery,
    shouldBypassCloseStopForRefresh
  };
}
