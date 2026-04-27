"use client";

import { useEffect, useRef, type RefObject } from "react";

const LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE = "data-live-media-polish";
const LIVE_WATCH_MEDIA_POLISH_READY_VALUE = "ready";
const LIVE_WATCH_MEDIA_POLISH_SIDE_INSET_PX = 2;
const LIVE_WATCH_MEDIA_POLISH_RADIUS_PX = 20;
const LIVE_WATCH_MEDIA_POLISH_STYLE_PROPERTIES = [
  "--live-watch-media-polish-left",
  "--live-watch-media-polish-top",
  "--live-watch-media-polish-width",
  "--live-watch-media-polish-height",
  "--live-watch-media-polish-side-inset",
  "--live-watch-media-polish-radius"
] as const;
const LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON = 0.001;

type UseLiveWatchMediaPolishArgs = Readonly<{
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

function clearLiveWatchMediaStagePolish(mediaStageElement: HTMLDivElement | null) {
  if (!mediaStageElement) {
    return;
  }

  mediaStageElement.removeAttribute(LIVE_WATCH_MEDIA_POLISH_ATTRIBUTE);

  for (const styleProperty of LIVE_WATCH_MEDIA_POLISH_STYLE_PROPERTIES) {
    mediaStageElement.style.removeProperty(styleProperty);
  }
}

function readLiveWatchMediaStageUniformScale(videoElement: HTMLVideoElement) {
  const computedTransform = window.getComputedStyle(videoElement).transform;

  if (!computedTransform || computedTransform === "none") {
    return 1;
  }

  let matrix: DOMMatrixReadOnly;

  try {
    matrix = new DOMMatrixReadOnly(computedTransform);
  } catch {
    return null;
  }

  if (
    !matrix.is2D ||
    !Number.isFinite(matrix.a) ||
    !Number.isFinite(matrix.b) ||
    !Number.isFinite(matrix.c) ||
    !Number.isFinite(matrix.d) ||
    !Number.isFinite(matrix.e) ||
    !Number.isFinite(matrix.f)
  ) {
    return null;
  }

  if (
    Math.abs(matrix.b) > LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON ||
    Math.abs(matrix.c) > LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON ||
    Math.abs(matrix.e) > LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON ||
    Math.abs(matrix.f) > LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON
  ) {
    return null;
  }

  if (
    matrix.a <= LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON ||
    matrix.d <= LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON ||
    Math.abs(matrix.a - matrix.d) > LIVE_WATCH_MEDIA_POLISH_TRANSFORM_EPSILON
  ) {
    return null;
  }

  return matrix.a;
}

function clampLiveWatchMediaStageCoordinate(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatLiveWatchMediaStagePx(value: number) {
  return `${value.toFixed(3)}px`;
}

export function useLiveWatchMediaPolish({
  enabled,
  videoRef
}: UseLiveWatchMediaPolishArgs) {
  const mediaStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mediaStageElement = mediaStageRef.current;
    const videoElement = videoRef.current;

    if (!enabled || !mediaStageElement || !videoElement) {
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

      if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const mediaStageRect = mediaStageElement.getBoundingClientRect();

      if (!(mediaStageRect.width > 0) || !(mediaStageRect.height > 0)) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const transformScale = readLiveWatchMediaStageUniformScale(videoElement);

      if (transformScale === null) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const containScale = Math.min(
        mediaStageRect.width / sourceWidth,
        mediaStageRect.height / sourceHeight
      );

      if (!(containScale > 0)) {
        clearLiveWatchMediaStagePolish(mediaStageElement);
        return;
      }

      const paintedWidth = sourceWidth * containScale * transformScale;
      const paintedHeight = sourceHeight * containScale * transformScale;
      const paintedLeft = (mediaStageRect.width - paintedWidth) / 2;
      const paintedTop = (mediaStageRect.height - paintedHeight) / 2;
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
        visibleWidth <= LIVE_WATCH_MEDIA_POLISH_SIDE_INSET_PX * 2 ||
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
        `${LIVE_WATCH_MEDIA_POLISH_SIDE_INSET_PX}px`
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

    mediaStageResizeObserver.observe(mediaStageElement);
    videoElement.addEventListener("loadedmetadata", scheduleLiveWatchMediaPolish);
    videoElement.addEventListener("resize", scheduleLiveWatchMediaPolish);
    window.addEventListener("resize", scheduleLiveWatchMediaPolish);
    scheduleLiveWatchMediaPolish();

    return () => {
      isDisposed = true;
      mediaStageResizeObserver.disconnect();
      videoElement.removeEventListener("loadedmetadata", scheduleLiveWatchMediaPolish);
      videoElement.removeEventListener("resize", scheduleLiveWatchMediaPolish);
      window.removeEventListener("resize", scheduleLiveWatchMediaPolish);

      if (mediaStageRequestId !== null) {
        window.cancelAnimationFrame(mediaStageRequestId);
      }

      clearLiveWatchMediaStagePolish(mediaStageElement);
    };
  }, [enabled, videoRef]);

  return mediaStageRef;
}
