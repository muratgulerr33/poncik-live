"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

const LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE = "data-live-media-polish";
const LIVE_WATCH_MEDIA_POLISH_PENDING_VALUE = "pending";
const LIVE_WATCH_MEDIA_POLISH_READY_VALUE = "ready";
const LIVE_WATCH_MEDIA_FIT_ATTRIBUTE = "data-live-media-fit";
const LIVE_WATCH_MEDIA_POLISH_CONTAIN_SIDE_INSET_PX = 2;
const LIVE_WATCH_MEDIA_POLISH_COVER_SIDE_INSET_PX = 0;
const LIVE_WATCH_MEDIA_POLISH_RADIUS_PX = 20;
const LIVE_WATCH_MEDIA_POLISH_STYLE_PROPERTIES = [
  "--live-watch-media-polish-left",
  "--live-watch-media-polish-top",
  "--live-watch-media-polish-width",
  "--live-watch-media-polish-height",
  "--live-watch-media-polish-side-inset",
  "--live-watch-media-polish-radius"
] as const;
const LIVE_WATCH_MEDIA_FIT_COVER = "cover";
const LIVE_WATCH_MEDIA_FIT_SAFE_CONTAIN = "safe-contain";

type UseLiveWatchMediaPolishArgs = Readonly<{
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

function clearLiveWatchMediaStagePolish(mediaStageElement: HTMLDivElement | null) {
  if (!mediaStageElement) {
    return;
  }

  mediaStageElement.removeAttribute(LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE);
  mediaStageElement.removeAttribute(LIVE_WATCH_MEDIA_FIT_ATTRIBUTE);

  for (const styleProperty of LIVE_WATCH_MEDIA_POLISH_STYLE_PROPERTIES) {
    mediaStageElement.style.removeProperty(styleProperty);
  }
}

function clampLiveWatchMediaStageCoordinate(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatLiveWatchMediaStagePx(value: number) {
  return `${value.toFixed(3)}px`;
}

function setLiveWatchMediaStagePolishPending(mediaStageElement: HTMLDivElement) {
  mediaStageElement.setAttribute(
    LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE,
    LIVE_WATCH_MEDIA_POLISH_PENDING_VALUE
  );

  for (const styleProperty of LIVE_WATCH_MEDIA_POLISH_STYLE_PROPERTIES) {
    mediaStageElement.style.removeProperty(styleProperty);
  }
}

function applyLiveWatchFullStagePolish({
  mediaStageElement,
  mediaStageRect,
  resolvedFitMode
}: Readonly<{
  mediaStageElement: HTMLDivElement;
  mediaStageRect: DOMRect;
  resolvedFitMode: string;
}>) {
  mediaStageElement.setAttribute(LIVE_WATCH_MEDIA_FIT_ATTRIBUTE, resolvedFitMode);
  mediaStageElement.style.setProperty("--live-watch-media-polish-left", "0.000px");
  mediaStageElement.style.setProperty("--live-watch-media-polish-top", "0.000px");
  mediaStageElement.style.setProperty(
    "--live-watch-media-polish-width",
    formatLiveWatchMediaStagePx(mediaStageRect.width)
  );
  mediaStageElement.style.setProperty(
    "--live-watch-media-polish-height",
    formatLiveWatchMediaStagePx(mediaStageRect.height)
  );
  mediaStageElement.style.setProperty("--live-watch-media-polish-side-inset", "0px");
  mediaStageElement.style.setProperty(
    "--live-watch-media-polish-radius",
    `${LIVE_WATCH_MEDIA_POLISH_RADIUS_PX}px`
  );
  mediaStageElement.setAttribute(
    LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE,
    LIVE_WATCH_MEDIA_POLISH_READY_VALUE
  );
}

function resolveLiveWatchMediaFitMode({
  frameHeight,
  frameWidth,
  sourceHeight,
  sourceWidth
}: Readonly<{
  frameHeight: number;
  frameWidth: number;
  sourceHeight: number;
  sourceWidth: number;
}>) {
  if (
    !(frameWidth > 0) ||
    !(frameHeight > 0) ||
    !(sourceWidth > 0) ||
    !(sourceHeight > 0)
  ) {
    return LIVE_WATCH_MEDIA_FIT_COVER;
  }

  const isPortraitFrame = frameHeight > frameWidth;
  const isNonPortraitSource = sourceWidth >= sourceHeight;

  if (isPortraitFrame && isNonPortraitSource) {
    return LIVE_WATCH_MEDIA_FIT_SAFE_CONTAIN;
  }

  return LIVE_WATCH_MEDIA_FIT_COVER;
}

export function useLiveWatchMediaPolish({
  enabled,
  videoRef
}: UseLiveWatchMediaPolishArgs) {
  const mediaStageRef = useRef<HTMLDivElement | null>(null);
  const lastVideoSourceRef = useRef<{
    currentSrc: string;
    srcObject: HTMLVideoElement["srcObject"];
  } | null>(null);

  useLayoutEffect(() => {
    const mediaStageElement = mediaStageRef.current;
    const videoElement = videoRef.current;

    if (!mediaStageElement || !videoElement) {
      clearLiveWatchMediaStagePolish(mediaStageElement);
      return;
    }

    let mediaStageRequestId: number | null = null;
    let isDisposed = false;

    const applyLiveWatchMediaPolish = () => {
      if (isDisposed) {
        return;
      }

      const sourceWidth = videoElement.videoWidth;
      const sourceHeight = videoElement.videoHeight;
      const mediaStageRect = mediaStageElement.getBoundingClientRect();
      const currentVideoSource = {
        currentSrc: videoElement.currentSrc,
        srcObject: videoElement.srcObject
      };
      const hasMediaSource =
        Boolean(currentVideoSource.srcObject) || currentVideoSource.currentSrc.length > 0;
      const lastVideoSource = lastVideoSourceRef.current;
      const hasVideoSourceChanged =
        lastVideoSource !== null &&
        (lastVideoSource.srcObject !== currentVideoSource.srcObject ||
          lastVideoSource.currentSrc !== currentVideoSource.currentSrc);

      if (hasVideoSourceChanged) {
        setLiveWatchMediaStagePolishPending(mediaStageElement);
      }

      lastVideoSourceRef.current = currentVideoSource;

      if (!(mediaStageRect.width > 0) || !(mediaStageRect.height > 0)) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const resolvedFitMode = resolveLiveWatchMediaFitMode({
        frameHeight: mediaStageRect.height,
        frameWidth: mediaStageRect.width,
        sourceHeight,
        sourceWidth
      });

      mediaStageElement.setAttribute(
        LIVE_WATCH_MEDIA_FIT_ATTRIBUTE,
        resolvedFitMode
      );

      if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
        if (!enabled && !hasMediaSource) {
          clearLiveWatchMediaStagePolish(mediaStageElement);
          return;
        }

        applyLiveWatchFullStagePolish({
          mediaStageElement,
          mediaStageRect,
          resolvedFitMode
        });
        return;
      }

      const fitScale =
        resolvedFitMode === LIVE_WATCH_MEDIA_FIT_COVER
          ? Math.max(
              mediaStageRect.width / sourceWidth,
              mediaStageRect.height / sourceHeight
            )
          : Math.min(
              mediaStageRect.width / sourceWidth,
              mediaStageRect.height / sourceHeight
            );

      if (!(fitScale > 0)) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const paintedWidth = sourceWidth * fitScale;
      const paintedHeight = sourceHeight * fitScale;
      const paintedLeft = (mediaStageRect.width - paintedWidth) / 2;
      const paintedTop = (mediaStageRect.height - paintedHeight) / 2;
      const sideInsetPx =
        resolvedFitMode === LIVE_WATCH_MEDIA_FIT_COVER
          ? LIVE_WATCH_MEDIA_POLISH_COVER_SIDE_INSET_PX
          : LIVE_WATCH_MEDIA_POLISH_CONTAIN_SIDE_INSET_PX;
      const visibleLeft = clampLiveWatchMediaStageCoordinate(
        paintedLeft,
        0,
        mediaStageRect.width
      );
      const visibleTop = clampLiveWatchMediaStageCoordinate(
        paintedTop,
        0,
        mediaStageRect.height
      );
      const visibleRight = clampLiveWatchMediaStageCoordinate(
        paintedLeft + paintedWidth,
        0,
        mediaStageRect.width
      );
      const visibleBottom = clampLiveWatchMediaStageCoordinate(
        paintedTop + paintedHeight,
        0,
        mediaStageRect.height
      );
      const visibleWidth = visibleRight - visibleLeft;
      const visibleHeight = visibleBottom - visibleTop;

      if (
        visibleWidth <= sideInsetPx * 2 ||
        !(visibleHeight > 0)
      ) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-left",
        formatLiveWatchMediaStagePx(visibleLeft)
      );
      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-top",
        formatLiveWatchMediaStagePx(visibleTop)
      );
      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-width",
        formatLiveWatchMediaStagePx(visibleWidth)
      );
      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-height",
        formatLiveWatchMediaStagePx(visibleHeight)
      );
      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-side-inset",
        `${sideInsetPx}px`
      );
      mediaStageElement.style.setProperty(
        "--live-watch-media-polish-radius",
        `${LIVE_WATCH_MEDIA_POLISH_RADIUS_PX}px`
      );
      mediaStageElement.setAttribute(
        LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE,
        LIVE_WATCH_MEDIA_POLISH_READY_VALUE
      );
    };

    const scheduleLiveWatchMediaPolish = () => {
      if (mediaStageRequestId !== null) {
        return;
      }

      mediaStageRequestId = window.requestAnimationFrame(() => {
        mediaStageRequestId = null;
        applyLiveWatchMediaPolish();
      });
    };

    const mediaStageResizeObserver = new ResizeObserver(() => {
      scheduleLiveWatchMediaPolish();
    });

    applyLiveWatchMediaPolish();
    mediaStageResizeObserver.observe(mediaStageElement);
    videoElement.addEventListener("loadedmetadata", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("loadeddata", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("canplay", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("playing", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("resize", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("emptied", scheduleLiveWatchMediaPolish);
    window.addEventListener("resize", scheduleLiveWatchMediaPolish);
    scheduleLiveWatchMediaPolish();

    return () => {
      isDisposed = true;
      mediaStageResizeObserver.disconnect();
      videoElement.removeEventListener("loadedmetadata", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("loadeddata", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("canplay", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("playing", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("resize", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("emptied", scheduleLiveWatchMediaPolish);
      window.removeEventListener("resize", scheduleLiveWatchMediaPolish);

      if (mediaStageRequestId !== null) {
        window.cancelAnimationFrame(mediaStageRequestId);
      }

      lastVideoSourceRef.current = null;
      clearLiveWatchMediaStagePolish(mediaStageElement);
    };
  }, [enabled, videoRef]);

  return mediaStageRef;
}
