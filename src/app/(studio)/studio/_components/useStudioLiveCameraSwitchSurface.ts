"use client";

import { useCallback, useRef, useState } from "react";

import type { StudioPublisherLiveVideoSwitchAttemptResult } from "../_adapters/studio-livekit-publisher-adapter";

type UseStudioLiveCameraSwitchSurfaceArgs = Readonly<{
  switchActiveLiveVideo: (
    deviceId: string
  ) => Promise<StudioPublisherLiveVideoSwitchAttemptResult>;
}>;

export type StudioLiveCameraSwitchResult =
  | StudioPublisherLiveVideoSwitchAttemptResult
  | {
      kind: "busy";
    };

export function useStudioLiveCameraSwitchSurface({
  switchActiveLiveVideo
}: UseStudioLiveCameraSwitchSurfaceArgs) {
  const isPendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const switchCamera = useCallback(
    async (deviceId: string): Promise<StudioLiveCameraSwitchResult> => {
      if (isPendingRef.current) {
        return {
          kind: "busy"
        };
      }

      isPendingRef.current = true;
      setIsPending(true);

      try {
        return await switchActiveLiveVideo(deviceId);
      } finally {
        isPendingRef.current = false;
        setIsPending(false);
      }
    },
    [switchActiveLiveVideo]
  );

  return {
    isPending,
    switchCamera
  };
}
