"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { LiveWatchGuestLoginForm } from "./LiveWatchGuestLoginForm";
import { LiveWatchGuestRegisterForm } from "./LiveWatchGuestRegisterForm";
import styles from "./live-watch-guest-auth-surface.module.css";

type LiveWatchGuestAuthSurfaceProps = Readonly<{
  isOpen: boolean;
  onAuthSuccess?: () => void;
  onClose: () => void;
}>;

export function LiveWatchGuestAuthSurface({
  isOpen,
  onAuthSuccess,
  onClose
}: LiveWatchGuestAuthSurfaceProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [surfaceSessionKey, setSurfaceSessionKey] = useState(0);
  const baseId = useId();
  const wasOpenRef = useRef(isOpen);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen && wasOpenRef.current) {
      setActiveTab("login");
      setSurfaceSessionKey((currentKey) => currentKey + 1);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    },
    [onClose]
  );

  const handleAuthSuccess = useCallback(() => {
    try {
      onAuthSuccess?.();
    } catch {
      // Notice feedback is non-critical; the auth success close flow must continue.
    } finally {
      router.refresh();
      onClose();
    }
  }, [onAuthSuccess, onClose, router]);

  const loginTabId = `${baseId}-login-tab`;
  const registerTabId = `${baseId}-register-tab`;
  const loginPanelId = `${baseId}-login-panel`;
  const registerPanelId = `${baseId}-register-panel`;
  const isLoginTabActive = activeTab === "login";
  const isRegisterTabActive = activeTab === "register";

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} forceMount />
        <Dialog.Content className={styles.content} forceMount>
          <Dialog.Title className={styles.screenReaderOnly}>
            Giriş ve kayıt
          </Dialog.Title>

          <div className={styles.surface}>
            <div className={styles.card}>
              <div className={styles.chrome}>
                <Dialog.Close asChild>
                  <button
                    aria-label="Giriş yüzeyini kapat"
                    className={styles.closeButton}
                    type="button"
                  >
                    <X aria-hidden="true" size={18} strokeWidth={2.2} />
                  </button>
                </Dialog.Close>
              </div>

              <div
                aria-label="Giriş seçenekleri"
                className={styles.tabRow}
                role="tablist"
              >
                <button
                  aria-controls={loginPanelId}
                  aria-selected={isLoginTabActive}
                  className={`${styles.tabButton} ${
                    isLoginTabActive ? styles.tabButtonActive : ""
                  }`}
                  id={loginTabId}
                  onClick={() => {
                    setActiveTab("login");
                  }}
                  role="tab"
                  tabIndex={isLoginTabActive ? 0 : -1}
                  type="button"
                >
                  Giriş
                </button>

                <button
                  aria-controls={registerPanelId}
                  aria-selected={isRegisterTabActive}
                  className={`${styles.tabButton} ${
                    isRegisterTabActive ? styles.tabButtonActive : ""
                  }`}
                  id={registerTabId}
                  onClick={() => {
                    setActiveTab("register");
                  }}
                  role="tab"
                  tabIndex={isRegisterTabActive ? 0 : -1}
                  type="button"
                >
                  Kayıt
                </button>
              </div>

              <div className={styles.formShell}>
                <div
                  aria-labelledby={loginTabId}
                  className={styles.panel}
                  hidden={!isLoginTabActive}
                  id={loginPanelId}
                  role="tabpanel"
                >
                  <LiveWatchGuestLoginForm
                    key={`guest-login-${surfaceSessionKey}`}
                    onSuccess={handleAuthSuccess}
                  />
                </div>

                <div
                  aria-labelledby={registerTabId}
                  className={styles.panel}
                  hidden={!isRegisterTabActive}
                  id={registerPanelId}
                  role="tabpanel"
                >
                  <LiveWatchGuestRegisterForm
                    key={`guest-register-${surfaceSessionKey}`}
                    onSuccess={handleAuthSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
