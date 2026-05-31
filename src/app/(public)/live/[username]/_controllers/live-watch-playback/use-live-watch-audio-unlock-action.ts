"use client";

import { useEffect } from "react";

type LiveWatchUnlockAudioAction = () => Promise<boolean>;

type UseLiveWatchAudioUnlockActionArgs = Readonly<{
  setUnlockAudioAction: (action: LiveWatchUnlockAudioAction | null) => void;
  unlockAudioFromUserGesture: LiveWatchUnlockAudioAction;
}>;

export function useLiveWatchAudioUnlockAction({
  setUnlockAudioAction,
  unlockAudioFromUserGesture
}: UseLiveWatchAudioUnlockActionArgs) {
  useEffect(() => {
    setUnlockAudioAction(unlockAudioFromUserGesture);

    return () => {
      setUnlockAudioAction(null);
    };
  }, [setUnlockAudioAction, unlockAudioFromUserGesture]);
}
