"use client";

import { useEffect, useRef, type RefObject } from "react";

const PREVIEW_MEDIA_POLISH_ATTRIBUTE = "data-media-polish";
const PREVIEW_MEDIA_POLISH_READY_VALUE = "ready";
const PREVIEW_MEDIA_POLISH_SIDE_INSET_PX = 2;
const PREVIEW_MEDIA_POLISH_RADIUS_PX = 20;
const PREVIEW_MEDIA_POLISH_STYLE_PROPERTIES = [
  "--preview-media-polish-left",
  "--preview-media-polish-top",
  "--preview-media-polish-width",
  "--preview-media-polish-height",
  "--preview-media-polish-side-inset",
  "--preview-media-polish-radius"
] as const;
const PREVIEW_TRANSFORM_EPSILON = 0.001;

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

function readPreviewVideoUniformScale(videoElement: HTMLVideoElement) {
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
    Math.abs(matrix.b) > PREVIEW_TRANSFORM_EPSILON ||
    Math.abs(matrix.c) > PREVIEW_TRANSFORM_EPSILON ||
    Math.abs(matrix.e) > PREVIEW_TRANSFORM_EPSILON ||
    Math.abs(matrix.f) > PREVIEW_TRANSFORM_EPSILON
  ) {
    return null;
  }

  if (
    matrix.a <= PREVIEW_TRANSFORM_EPSILON ||
    matrix.d <= PREVIEW_TRANSFORM_EPSILON ||
    Math.abs(matrix.a - matrix.d) > PREVIEW_TRANSFORM_EPSILON
  ) {
    return null;
  }

  return matrix.a;
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

      const transformScale = readPreviewVideoUniformScale(videoElement);

      if (transformScale === null) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const containScale = Math.min(
        frameRect.width / sourceWidth,
        frameRect.height / sourceHeight
      );

      if (!(containScale > 0)) {
        clearPreviewMediaPolish(frameElement);
        return;
      }

      const paintedWidth = sourceWidth * containScale * transformScale;
      const paintedHeight = sourceHeight * containScale * transformScale;
      const paintedLeft = (frameRect.width - paintedWidth) / 2;
      const paintedTop = (frameRect.height - paintedHeight) / 2;
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
        visibleWidth <= PREVIEW_MEDIA_POLISH_SIDE_INSET_PX * 2 ||
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
        `${PREVIEW_MEDIA_POLISH_SIDE_INSET_PX}px`
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
