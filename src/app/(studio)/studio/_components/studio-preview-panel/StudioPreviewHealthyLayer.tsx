"use client";

import type { Room } from "livekit-client";
import type { ReactNode } from "react";

import { STUDIO_COPY } from "../../_lib/studio-copy";
import { StudioChatOwners } from "../StudioChatOwners";
import { StudioStartFeedback } from "../StudioStartFeedback";
import styles from "../studio-preview-panel.module.css";
import { StudioPreviewActionSlot } from "./StudioPreviewActionSlot";

type StudioPreviewHealthyLayerProps = Readonly<{
  effectiveLifecycleKind: "idle" | "live" | "degraded";
  isStarting: boolean;
  isStopping: boolean;
  lifecycleActions: ReactNode;
  publisherRoom: Room | null;
  shouldShowSuccessFeedback: boolean;
  username: string;
}>;

export function StudioPreviewHealthyLayer({
  effectiveLifecycleKind,
  isStarting,
  isStopping,
  lifecycleActions,
  publisherRoom,
  shouldShowSuccessFeedback,
  username
}: StudioPreviewHealthyLayerProps) {
  return (
    <>
      <div className={styles.sceneSuccessFeedbackLane}>
        {shouldShowSuccessFeedback ? (
          <StudioStartFeedback message={STUDIO_COPY.startBroadcastSuccessLabel} />
        ) : null}
      </div>

      <StudioChatOwners
        effectiveLifecycleKind={effectiveLifecycleKind}
        isStarting={isStarting}
        isStopping={isStopping}
        room={publisherRoom}
        username={username}
      />

      <StudioPreviewActionSlot>{lifecycleActions}</StudioPreviewActionSlot>
    </>
  );
}
