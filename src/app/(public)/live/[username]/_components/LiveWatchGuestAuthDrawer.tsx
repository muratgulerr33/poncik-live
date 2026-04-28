"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState
} from "react";

import { LiveWatchGuestLoginForm } from "./LiveWatchGuestLoginForm";
import { LiveWatchGuestRegisterForm } from "./LiveWatchGuestRegisterForm";
import styles from "./live-watch-guest-auth-drawer.module.css";
import { useLiveWatchGuestAuthViewport } from "./useLiveWatchGuestAuthViewport";

type LiveWatchGuestAuthDrawerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>;

const DRAWER_MOTION_DURATION_MS = 240;
const DRAWER_CLOSE_FALLBACK_BUFFER_MS = 120;
const REDUCED_MOTION_DURATION_MS = 1;

function drawerStateReducer(
  currentState: "closed" | "opening" | "open" | "closing",
  nextState: "closed" | "opening" | "open" | "closing"
) {
  return currentState === nextState ? currentState : nextState;
}

export function LiveWatchGuestAuthDrawer({
  isOpen,
  onClose
}: LiveWatchGuestAuthDrawerProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [drawerSessionKey, setDrawerSessionKey] = useState(0);
  const [drawerState, syncDrawerState] = useReducer(
    drawerStateReducer,
    isOpen ? "opening" : "closed"
  );
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const drawerBodyRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const openFrameOneRef = useRef<number | null>(null);
  const openFrameTwoRef = useRef<number | null>(null);
  const closeTransitionCleanupRef = useRef<(() => void) | null>(null);
  const isSyncingDialogCloseRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const router = useRouter();
  const isDialogVisible = isOpen || drawerState !== "closed";

  useLiveWatchGuestAuthViewport({
    bodyRef: drawerBodyRef,
    enabled: isOpen,
    rootRef: dialogRef
  });

  const resetDrawerState = useCallback(() => {
    setActiveTab("login");
    setDrawerSessionKey((currentKey) => currentKey + 1);
  }, []);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }, []);

  const clearOpenFrames = useCallback(() => {
    if (openFrameOneRef.current !== null) {
      window.cancelAnimationFrame(openFrameOneRef.current);
      openFrameOneRef.current = null;
    }

    if (openFrameTwoRef.current !== null) {
      window.cancelAnimationFrame(openFrameTwoRef.current);
      openFrameTwoRef.current = null;
    }
  }, []);

  const clearCloseTransition = useCallback(() => {
    if (closeTransitionCleanupRef.current === null) {
      return;
    }

    closeTransitionCleanupRef.current();
    closeTransitionCleanupRef.current = null;
  }, []);

  const getMotionDuration = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return REDUCED_MOTION_DURATION_MS;
    }

    return DRAWER_MOTION_DURATION_MS;
  }, []);

  const getCloseFallbackDuration = useCallback(() => {
    const motionDuration = getMotionDuration();
    return motionDuration + (motionDuration === REDUCED_MOTION_DURATION_MS ? 20 : DRAWER_CLOSE_FALLBACK_BUFFER_MS);
  }, [getMotionDuration]);

  const requestDrawerClose = useCallback(
    (notifyParent = true) => {
      clearOpenFrames();

      if (drawerState !== "closed" && drawerState !== "closing") {
        syncDrawerState("closing");
      }

      if (notifyParent && isOpen) {
        onClose();
      }
    },
    [clearOpenFrames, drawerState, isOpen, onClose]
  );

  const handleDrawerCloseRequest = useCallback(() => {
    requestDrawerClose();
  }, [requestDrawerClose]);

  useEffect(() => {
    if (!isDialogVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDialogVisible]);

  useEffect(() => {
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      isSyncingDialogCloseRef.current = false;
      clearOpenFrames();
      clearCloseTimeout();
      clearCloseTransition();
    };
  }, [clearCloseTimeout, clearCloseTransition, clearOpenFrames]);

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (!dialogElement) {
      return;
    }

    const handleDialogCancel = (event: Event) => {
      event.preventDefault();
      requestDrawerClose();
    };

    const handleDialogClose = () => {
      clearOpenFrames();
      clearCloseTimeout();
      clearCloseTransition();
      syncDrawerState("closed");

      if (isSyncingDialogCloseRef.current) {
        isSyncingDialogCloseRef.current = false;
        resetDrawerState();
        return;
      }

      resetDrawerState();
      onClose();
    };

    dialogElement.addEventListener("cancel", handleDialogCancel);
    dialogElement.addEventListener("close", handleDialogClose);

    return () => {
      dialogElement.removeEventListener("cancel", handleDialogCancel);
      dialogElement.removeEventListener("close", handleDialogClose);
    };
  }, [
    clearCloseTimeout,
    clearCloseTransition,
    clearOpenFrames,
    onClose,
    requestDrawerClose,
    resetDrawerState
  ]);

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (!dialogElement) {
      return;
    }

    if (isOpen) {
      clearCloseTransition();
      clearCloseTimeout();

      if (!dialogElement.open) {
        try {
          dialogElement.showModal();
        } catch {}
      }

      if (drawerState === "closed" || drawerState === "closing") {
        syncDrawerState("opening");
      }

      return;
    }

    requestDrawerClose(false);
  }, [clearCloseTimeout, clearCloseTransition, drawerState, isOpen, requestDrawerClose]);

  useEffect(() => {
    if (drawerState !== "opening") {
      return;
    }

    clearOpenFrames();
    openFrameOneRef.current = window.requestAnimationFrame(() => {
      openFrameOneRef.current = null;
      openFrameTwoRef.current = window.requestAnimationFrame(() => {
        openFrameTwoRef.current = null;

        if (isUnmountedRef.current || !dialogRef.current?.open || drawerState !== "opening") {
          return;
        }

        syncDrawerState("open");
      });
    });

    return clearOpenFrames;
  }, [clearOpenFrames, drawerState]);

  useLayoutEffect(() => {
    if (drawerState !== "closing") {
      clearCloseTransition();
      clearCloseTimeout();
      return;
    }

    const dialogElement = dialogRef.current;
    const panelElement = panelRef.current;

    if (!dialogElement || !panelElement || !dialogElement.open) {
      return;
    }

    let finalized = false;

    const finalizeClose = () => {
      if (
        finalized ||
        isUnmountedRef.current ||
        dialogRef.current !== dialogElement ||
        panelRef.current !== panelElement
      ) {
        return;
      }

      finalized = true;
      clearCloseTransition();
      clearCloseTimeout();

      isSyncingDialogCloseRef.current = true;

      try {
        dialogElement.close();
      } catch {
        isSyncingDialogCloseRef.current = false;
      } finally {
        queueMicrotask(() => {
          if (isUnmountedRef.current || dialogRef.current !== dialogElement || !dialogElement.open) {
            isSyncingDialogCloseRef.current = false;
          }
        });
      }
    };

    const handlePanelTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== panelElement || event.propertyName !== "transform") {
        return;
      }

      finalizeClose();
    };

    panelElement.addEventListener("transitionend", handlePanelTransitionEnd);
    closeTimeoutRef.current = window.setTimeout(
      finalizeClose,
      getCloseFallbackDuration()
    );

    closeTransitionCleanupRef.current = () => {
      panelElement.removeEventListener("transitionend", handlePanelTransitionEnd);
    };

    return () => {
      clearCloseTransition();
      clearCloseTimeout();
    };
  }, [
    clearCloseTimeout,
    clearCloseTransition,
    drawerState,
    getCloseFallbackDuration
  ]);

  const handleAuthSuccess = useCallback(() => {
    router.refresh();
    requestDrawerClose();
  }, [requestDrawerClose, router]);

  const handleDialogBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target !== dialogRef.current) {
        return;
      }

      requestDrawerClose();
    },
    [requestDrawerClose]
  );

  return (
    <dialog
      aria-label="Yorum için giriş veya kayıt"
      className={styles.dialog}
      data-drawer-state={drawerState}
      onClick={handleDialogBackdropClick}
      ref={dialogRef}
    >
      <div
        className={styles.panel}
        data-auth-tab={activeTab}
        ref={panelRef}
      >
        <div className={styles.handle} aria-hidden="true" />
        <button
          aria-label="Giriş yüzeyini kapat"
          className={styles.closeButton}
          onClick={handleDrawerCloseRequest}
          type="button"
        >
          <X aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>

        <div className={styles.tabRow} role="tablist" aria-label="Giriş seçenekleri">
          <button
            aria-selected={activeTab === "login"}
            className={`${styles.tabButton} ${
              activeTab === "login" ? styles.tabButtonActive : ""
            }`}
            onClick={() => {
              setActiveTab("login");
            }}
            role="tab"
            type="button"
          >
            Giriş
          </button>
          <button
            aria-selected={activeTab === "register"}
            className={`${styles.tabButton} ${
              activeTab === "register" ? styles.tabButtonActive : ""
            }`}
            onClick={() => {
              setActiveTab("register");
            }}
            role="tab"
            type="button"
          >
            Kayıt
          </button>
        </div>

        <div className={styles.body} ref={drawerBodyRef}>
          {activeTab === "login" ? (
            <LiveWatchGuestLoginForm
              key={`guest-login-${drawerSessionKey}`}
              onSuccess={handleAuthSuccess}
            />
          ) : (
            <LiveWatchGuestRegisterForm
              key={`guest-register-${drawerSessionKey}`}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    </dialog>
  );
}
