"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";

import {
  publishStudioPublisherCameraTrack,
  unpublishStudioPublisherCameraTrack
} from "../_adapters/studio-livekit-publisher-adapter";
import type { StudioPreviewCameraSwitchCallbacks } from "./useStudioPreviewBootstrap";

type UseStudioPublishedCameraSwitchArgs = {
  getPublisherRoom: () => Room | null;
  switchPreviewCamera: (
    callbacks?: StudioPreviewCameraSwitchCallbacks
  ) => Promise<boolean>;
};

export function useStudioPublishedCameraSwitch({
  getPublisherRoom,
  switchPreviewCamera
}: UseStudioPublishedCameraSwitchArgs) {
  const isMountedRef = useRef(false);
  const isPendingRef = useRef(false);
  const [isPublishedCameraSwitchPending, setIsPublishedCameraSwitchPending] =
    useState(false);

  const switchPublishedCamera = useCallback(async () => {
    if (isPendingRef.current) {
      return false;
    }

    if (!getPublisherRoom()) {
      return false;
    }

    isPendingRef.current = true;
    setIsPublishedCameraSwitchPending(true);

    try {
      return await switchPreviewCamera({
        beforeCurrentVideoStop: async ({
          currentVideoTrack
        }) => {
          return await unpublishStudioPublisherCameraTrack(
            getPublisherRoom(),
            currentVideoTrack
          );
        },
        afterNextVideoAttachBeforeCommit: async ({
          nextVideoTrack
        }) => {
          return await publishStudioPublisherCameraTrack(
            getPublisherRoom(),
            nextVideoTrack
          );
        },
        afterNextVideoCommitAborted: async ({
          nextVideoTrack
        }) => {
          await unpublishStudioPublisherCameraTrack(getPublisherRoom(), nextVideoTrack);
        }
      });
    } finally {
      isPendingRef.current = false;

      if (isMountedRef.current) {
        setIsPublishedCameraSwitchPending(false);
      }
    }
  }, [getPublisherRoom, switchPreviewCamera]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isPendingRef.current = false;
    };
  }, []);

  return {
    isPublishedCameraSwitchPending,
    switchPublishedCamera
  };
}
