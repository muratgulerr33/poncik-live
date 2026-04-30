"use client";

import { useEffect, useRef, type RefObject } from "react";

const PREVIEW_MEDIA_POLISH_ATTRIBUTE = "data-media-polish";
const PREVIEW_MEDIA_POLISH_READY_VALUE = "ready";
const PREVIEW_MEDIA_POLISH_CONTAIN_SIDE_INSET_PX = 2;
const PREVIEW_MEDIA_POLISH_COVER_SIDE_INSET_PX = 0;
const PREVIEW_MEDIA_POLISH_RADIUS_PX = 20;
const PREVIEW_MEDIA_POLISH_STYLE_PROPERTIES = [
  "--preview-media-polish-left",
  "--preview-media-polish-top",
  "--preview-media-polish-width",
  "--preview-media-polish-height",
  "--preview-media-polish-side-inset",
  "--preview-media-polish-radius"
] as const;
const PREVIEW_MEDIA_POLISH_FIT_CONTAIN = "contain";
const PREVIEW_MEDIA_POLISH_FIT_COVER = "cover";

type UseStudioPreviewMediaPolishArgs = {
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

function clearPreviewMediaPolish(frameElement: HTMLDivElement | null) {
  if (!frameElement) {
    return;
  }

  frameElement.removeAttribute(PREVIEW_MEDIA_POLISH_ATTRIBUTE);

  for (const styleProperty of PREVIEW_MEDIA_POLISH_STYLE_PROPERTIES) {
    frameElement.style.removeProperty(styleProperty);
  }
}

function readPreviewVideoObjectFit(videoElement: HTMLVideoElement) {
  const computedObjectFit = window.getComputedStyle(videoElement).objectFit;

  if (
    computedObjectFit === PREVIEW_MEDIA_POLISH_FIT_CONTAIN ||
    computedObjectFit === PREVIEW_MEDIA_POLISH_FIT_COVER
  ) {
    return computedObjectFit;
  }

  return null;
}

function clampPreviewMediaCoordinate(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPreviewMediaPx(value: number) {
  return `${value.toFixed(3)}px`;
}

export function useStudioPreviewMediaPolish({
  enabled,
  videoRef
}: UseStudioPreviewMediaPolishArgs) {
  const previewFrameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frameElement = previewFrameRef.current;
    const videoElement = videoRef.current;

    if (!enabled || !frameElement || !videoElement) {
      clearPreviewMediaPolish(frameElement);
      return;
    }

    let frameRequestId: number | null = null;
    let isDisposed = false;

    const applyPreviewMediaPolish = () => {
      if (isDisposed) {
        return;
      }

      const sourceWidth = videoElement.videoWidth;
      const sourceHeight = videoElement.videoHeight;

      if (!(sourceWidth > 0) || !(sourceHeight > 0)) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const frameRect = frameElement.getBoundingClientRect();

      if (!(frameRect.width > 0) || !(frameRect.height > 0)) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const objectFit = readPreviewVideoObjectFit(videoElement);

      if (objectFit === null) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const fitScale =
        objectFit === PREVIEW_MEDIA_POLISH_FIT_COVER
          ? Math.max(frameRect.width / sourceWidth, frameRect.height / sourceHeight)
          : Math.min(frameRect.width / sourceWidth, frameRect.height / sourceHeight);

      if (!(fitScale > 0)) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const paintedWidth = sourceWidth * fitScale;
      const paintedHeight = sourceHeight * fitScale;
      const paintedLeft = (frameRect.width - paintedWidth) / 2;
      const paintedTop = (frameRect.height - paintedHeight) / 2;
      const sideInsetPx =
        objectFit === PREVIEW_MEDIA_POLISH_FIT_COVER
          ? PREVIEW_MEDIA_POLISH_COVER_SIDE_INSET_PX
          : PREVIEW_MEDIA_POLISH_CONTAIN_SIDE_INSET_PX;
      const visibleLeft = clampPreviewMediaCoordinate(paintedLeft, 0, frameRect.width);
      const visibleTop = clampPreviewMediaCoordinate(paintedTop, 0, frameRect.height);
      const visibleRight = clampPreviewMediaCoordinate(
        paintedLeft + paintedWidth,
        0,
        frameRect.width
      );
      const visibleBottom = clampPreviewMediaCoordinate(
        paintedTop + paintedHeight,
        0,
        frameRect.height
      );
      const visibleWidth = visibleRight - visibleLeft;
      const visibleHeight = visibleBottom - visibleTop;

      if (
        visibleWidth <= sideInsetPx * 2 ||
        !(visibleHeight > 0)
      ) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      frameElement.style.setProperty(
        "--preview-media-polish-left",
        formatPreviewMediaPx(visibleLeft)
      );
      frameElement.style.setProperty(
        "--preview-media-polish-top",
        formatPreviewMediaPx(visibleTop)
      );
      frameElement.style.setProperty(
        "--preview-media-polish-width",
        formatPreviewMediaPx(visibleWidth)
      );
      frameElement.style.setProperty(
        "--preview-media-polish-height",
        formatPreviewMediaPx(visibleHeight)
      );
      frameElement.style.setProperty(
        "--preview-media-polish-side-inset",
        `${sideInsetPx}px`
      );
      frameElement.style.setProperty(
        "--preview-media-polish-radius",
        `${PREVIEW_MEDIA_POLISH_RADIUS_PX}px`
      );
      frameElement.setAttribute(
        PREVIEW_MEDIA_POLISH_ATTRIBUTE,
        PREVIEW_MEDIA_POLISH_READY_VALUE
      );
    };

    const schedulePreviewMediaPolish = () => {
      if (frameRequestId !== null) {
        return;
      }

      frameRequestId = window.requestAnimationFrame(() => {
        frameRequestId = null;
        applyPreviewMediaPolish();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      schedulePreviewMediaPolish();
    });

    resizeObserver.observe(frameElement);
    videoElement.addEventListener("loadedmetadata", schedulePreviewMediaPolish);
    videoElement.addEventListener("resize", schedulePreviewMediaPolish);
    window.addEventListener("resize", schedulePreviewMediaPolish);
    schedulePreviewMediaPolish();

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      videoElement.removeEventListener("loadedmetadata", schedulePreviewMediaPolish);
      videoElement.removeEventListener("resize", schedulePreviewMediaPolish);
      window.removeEventListener("resize", schedulePreviewMediaPolish);

      if (frameRequestId !== null) {
        window.cancelAnimationFrame(frameRequestId);
      }

      clearPreviewMediaPolish(frameElement);
    };
  }, [enabled, videoRef]);

  return previewFrameRef;
}
