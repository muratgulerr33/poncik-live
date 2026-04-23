"use client";

import { useCallback, useRef, useState } from "react";

import type {
  StudioPublisherLiveVideoSwitchAttemptResult,
  StudioPublisherLiveVideoSwitchRequest
} from "../_adapters/studio-livekit-publisher-adapter";

type UseStudioLiveCameraSwitchSurfaceArgs = Readonly<{
  catchUpPreviewAfterSwitch: () => Promise<boolean>;
  preparePreviewForReverseSwitch: () => Promise<boolean>;
  restorePreviewAfterFailedReverseSwitch: () => Promise<boolean>;
  switchActiveLiveVideo: (
    input: StudioPublisherLiveVideoSwitchRequest
  ) => Promise<StudioPublisherLiveVideoSwitchAttemptResult>;
}>;

export type StudioLiveCameraSwitchResult =
  | StudioPublisherLiveVideoSwitchAttemptResult
  | {
      kind: "busy";
    }
  | {
      kind: "preview_failed";
    };

export function useStudioLiveCameraSwitchSurface({
  catchUpPreviewAfterSwitch,
  preparePreviewForReverseSwitch,
  restorePreviewAfterFailedReverseSwitch,
  switchActiveLiveVideo
}: UseStudioLiveCameraSwitchSurfaceArgs) {
  const isPendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const switchCamera = useCallback(
    async (input: StudioPublisherLiveVideoSwitchRequest): Promise<StudioLiveCameraSwitchResult> => {
      if (isPendingRef.current) {
        return {
          kind: "busy"
        };
      }

      isPendingRef.current = true;
      setIsPending(true);

      try {
        const didReleasePreviewForReverseSwitch =
          input.preferredFacingMode === "user"
            ? await preparePreviewForReverseSwitch()
            : false;
        const switchResult = await switchActiveLiveVideo(input);

        if (switchResult.kind !== "success") {
          if (didReleasePreviewForReverseSwitch) {
            await restorePreviewAfterFailedReverseSwitch();
          }

          return switchResult;
        }

        const didCatchUpPreview = await catchUpPreviewAfterSwitch();

        if (!didCatchUpPreview) {
          if (didReleasePreviewForReverseSwitch) {
            await restorePreviewAfterFailedReverseSwitch();
          }

          return {
            kind: "preview_failed"
          };
        }

        return {
          kind: "success"
        };
      } finally {
        isPendingRef.current = false;
        setIsPending(false);
      }
    },
    [
      catchUpPreviewAfterSwitch,
      preparePreviewForReverseSwitch,
      restorePreviewAfterFailedReverseSwitch,
      switchActiveLiveVideo
    ]
  );

  return {
    isPending,
    switchCamera
  };
}
