"use client";

import type { RefObject } from "react";

import styles from "./studio-chat-owners.module.css";
import type { StudioChatMessageRow } from "./StudioChatOwners";

type StudioChatOwnersSurfaceProps = Readonly<{
  inputRef: RefObject<HTMLInputElement | null>;
  inputValue: string;
  isActive: boolean;
  messages: readonly StudioChatMessageRow[];
  overlayScrollRef: RefObject<HTMLDivElement | null>;
  phase: "live" | "exiting";
  username: string;
  onInputValueChange: (nextValue: string) => void;
  onSubmitMessage: () => void;
}>;

export function StudioChatOwnersSurface({
  inputRef,
  inputValue,
  isActive,
  messages,
  overlayScrollRef,
  phase,
  username,
  onInputValueChange,
  onSubmitMessage
}: StudioChatOwnersSurfaceProps) {
  const isSubmitDisabled = !isActive || inputValue.trim().length === 0;

  return (
    <div className={styles.chatLayer} data-phase={phase}>
      <section
        aria-label="Sohbet katmanı"
        className={styles.overlayOwner}
        data-active={isActive ? "true" : "false"}
        data-owner="message-overlay"
      >
        <div className={styles.overlayViewport}>
          <div className={styles.overlayScroll} ref={overlayScrollRef}>
            <div className={styles.messageStack}>
              {messages.map((message) => (
                <article className={styles.messageRow} key={message.id}>
                  <div className={styles.messageCard}>
                    <p className={styles.messageUsername}>{message.username}</p>
                    <p className={styles.messageContent}>{message.text}</p>
                  </div>
                </article>
              ))}
              {messages.length === 0 ? (
                <div className={styles.messageEmptyState} aria-hidden="true" />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <form
        className={styles.composerOwner}
        data-active={isActive ? "true" : "false"}
        data-owner="composer-dock"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitMessage();
        }}
      >
        <div className={styles.composerPresence}>
          <span className={styles.composerPresenceLabel}>{username}</span>
        </div>

        <label className={styles.composerField}>
          <span className={styles.screenReaderOnly}>Mesaj yaz</span>
          <input
            autoComplete="off"
            className={styles.composerInput}
            disabled={!isActive}
            enterKeyHint="send"
            maxLength={220}
            onChange={(event) => {
              onInputValueChange(event.currentTarget.value);
            }}
            placeholder="Mesaj yaz"
            ref={inputRef}
            type="text"
            value={inputValue}
          />
        </label>

        <button
          className={styles.sendButton}
          disabled={isSubmitDisabled}
          type="submit"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
