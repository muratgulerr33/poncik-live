"use client";

import { useEffect, type RefObject } from "react";

type UseLiveWatchVideoSettleEventsArgs = Readonly<{
  onPossibleVideoSettle: () => void;
  videoElementRef: RefObject<HTMLVideoElement | null>;
}>;

export function useLiveWatchVideoSettleEvents({
  onPossibleVideoSettle,
  videoElementRef
}: UseLiveWatchVideoSettleEventsArgs) {
  useEffect(() => {
    const videoElement = videoElementRef.current;
    if (!videoElement) {
      return;
    }

    const handlePossibleVideoSettle = () => {
      onPossibleVideoSettle();
    };

    handlePossibleVideoSettle();

    videoElement.addEventListener("playing", handlePossibleVideoSettle);
    videoElement.addEventListener("loadeddata", handlePossibleVideoSettle);
    videoElement.addEventListener("canplay", handlePossibleVideoSettle);
    videoElement.addEventListener("timeupdate", handlePossibleVideoSettle);
    videoElement.addEventListener("resize", handlePossibleVideoSettle);

    return () => {
      videoElement.removeEventListener("playing", handlePossibleVideoSettle);
      videoElement.removeEventListener("loadeddata", handlePossibleVideoSettle);
      videoElement.removeEventListener("canplay", handlePossibleVideoSettle);
      videoElement.removeEventListener("timeupdate", handlePossibleVideoSettle);
      videoElement.removeEventListener("resize", handlePossibleVideoSettle);
    };
  }, [onPossibleVideoSettle, videoElementRef]);
}
