"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { SendHorizontal } from "lucide-react";

import type { LiveWatchChatAccess } from "../_controllers/LiveWatchChatController";
import styles from "./live-watch-chat.module.css";

export type LiveWatchChatMessage = Readonly<{
  content: string;
  id: string;
  username: string;
}>;

type LiveWatchChatSurfaceProps = Readonly<{
  access: LiveWatchChatAccess;
  draft: string;
  isInteractive: boolean;
  messages: readonly LiveWatchChatMessage[];
  onDraftChange: (nextValue: string) => void;
  onSubmit: () => void;
  overlayScrollRef: RefObject<HTMLDivElement | null>;
}>;

export function LiveWatchChatSurface({
  access,
  draft,
  isInteractive,
  messages,
  onDraftChange,
  onSubmit,
  overlayScrollRef
}: LiveWatchChatSurfaceProps) {
  const isViewerReady = access.kind === "viewer_ready";
  const isGuest = access.kind === "guest";
  const isComposerVisible = isViewerReady && isInteractive;
  const isGuestActionVisible = isGuest && isInteractive;
  const isSubmitDisabled = !isComposerVisible || draft.trim().length === 0;

  return (
    <div
      aria-hidden={!isInteractive && messages.length === 0}
      className={styles.chatLayer}
      data-interactive={isInteractive ? "true" : "false"}
    >
      {messages.length > 0 ? (
        <section aria-label="Sohbet katmanı" className={styles.historyLayer}>
          <div className={styles.historyViewport}>
            <div className={styles.historyScroll} ref={overlayScrollRef}>
              <div className={styles.messageStack}>
                {messages.map((message) => (
                  <article className={styles.messageRow} key={message.id}>
                    <div className={styles.messageCard}>
                      <p className={styles.messageUsername}>{message.username}</p>
                      <p className={styles.messageContent}>{message.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isComposerVisible ? (
        <form
          className={styles.composerDock}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className={styles.composerField}>
            <span className={styles.screenReaderOnly}>Mesaj yaz</span>
            <input
              autoComplete="off"
              className={styles.composerInput}
              enterKeyHint="send"
              maxLength={220}
              onChange={(event) => {
                onDraftChange(event.currentTarget.value);
              }}
              placeholder="Mesaj yaz"
              type="text"
              value={draft}
            />
          </label>

          <button
            aria-label="Mesaj gönder"
            className={styles.sendButton}
            disabled={isSubmitDisabled}
            type="submit"
          >
            <SendHorizontal aria-hidden="true" size={16} />
          </button>
        </form>
      ) : null}

      {isGuestActionVisible ? (
        <div className={styles.guestActionDock}>
          <Link className={styles.guestActionLink} href="/auth">
            Yorum yapmak için giriş yap
          </Link>
        </div>
      ) : null}
    </div>
  );
}
