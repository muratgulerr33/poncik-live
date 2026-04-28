"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  useCallback,
  useEffect,
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

export function LiveWatchGuestAuthDrawer({
  isOpen,
  onClose
}: LiveWatchGuestAuthDrawerProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [drawerSessionKey, setDrawerSessionKey] = useState(0);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const drawerBodyRef = useRef<HTMLDivElement | null>(null);
  const isSyncingDialogCloseRef = useRef(false);
  const router = useRouter();

  useLiveWatchGuestAuthViewport({
    bodyRef: drawerBodyRef,
    enabled: isOpen,
    rootRef: dialogRef
  });

  const resetDrawerState = useCallback(() => {
    setActiveTab("login");
    setDrawerSessionKey((currentKey) => currentKey + 1);
  }, []);

  const requestDrawerClose = useCallback(() => {
    resetDrawerState();
    onClose();
  }, [onClose, resetDrawerState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
      if (isSyncingDialogCloseRef.current) {
        isSyncingDialogCloseRef.current = false;
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
  }, [onClose, requestDrawerClose, resetDrawerState]);

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (!dialogElement) {
      return;
    }

    if (isOpen) {
      if (!dialogElement.open) {
        try {
          dialogElement.showModal();
        } catch {}
      }

      return;
    }

    if (!dialogElement.open) {
      return;
    }

    isSyncingDialogCloseRef.current = true;

    try {
      dialogElement.close();
    } catch {
      isSyncingDialogCloseRef.current = false;
    }
  }, [isOpen]);

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
      onClick={handleDialogBackdropClick}
      ref={dialogRef}
    >
      <div className={styles.panel} data-auth-tab={activeTab}>
        <div className={styles.handle} aria-hidden="true" />
        <button
          aria-label="Giriş yüzeyini kapat"
          className={styles.closeButton}
          onClick={requestDrawerClose}
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
