"use client";

const STUDIO_MOBILE_PORTRAIT_CAPTURE_WIDTH = 960;
const STUDIO_MOBILE_PORTRAIT_CAPTURE_HEIGHT = 540;
const STUDIO_MOBILE_PORTRAIT_CAPTURE_FRAME_RATE = 24;
const STUDIO_MOBILE_PORTRAIT_MAX_WIDTH_PX = 640;
const STUDIO_PORTRAIT_SAFE_MAX_ASPECT_RATIO = 0.8;

type StudioNavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

export type StudioCameraSourceShape = {
  aspectRatio: number | null;
  height: number;
  width: number;
};

export function shouldUseStudioMobilePortraitCaptureContract(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const isPortraitOrientation = window.matchMedia("(orientation: portrait)").matches;
  const isNarrowViewport = window.matchMedia(
    `(max-width: ${STUDIO_MOBILE_PORTRAIT_MAX_WIDTH_PX}px)`
  ).matches;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const userAgentData = (navigator as StudioNavigatorWithUserAgentData).userAgentData;
  const isMobileUserAgent = userAgentData?.mobile === true;

  return (
    isPortraitOrientation &&
    isNarrowViewport &&
    (hasTouchPoints || hasCoarsePointer || isMobileUserAgent)
  );
}

export function createStudioMobilePortraitCaptureConstraints(input?: {
  deviceId?: string;
}): MediaTrackConstraints {
  const deviceConstraint = input?.deviceId
    ? {
        deviceId: {
          exact: input.deviceId
        }
      }
    : {};

  return {
    ...deviceConstraint,
    width: {
      ideal: STUDIO_MOBILE_PORTRAIT_CAPTURE_WIDTH
    },
    height: {
      ideal: STUDIO_MOBILE_PORTRAIT_CAPTURE_HEIGHT
    },
    frameRate: {
      ideal: STUDIO_MOBILE_PORTRAIT_CAPTURE_FRAME_RATE,
      max: STUDIO_MOBILE_PORTRAIT_CAPTURE_FRAME_RATE
    }
  };
}

export function readStudioCameraSourceShape(
  track: MediaStreamTrack | null
): StudioCameraSourceShape {
  if (!track) {
    return {
      aspectRatio: null,
      height: 0,
      width: 0
    };
  }

  try {
    const settings = track.getSettings();
    const width =
      typeof settings.width === "number" && settings.width > 0 ? settings.width : 0;
    const height =
      typeof settings.height === "number" && settings.height > 0 ? settings.height : 0;
    const aspectRatio =
      typeof settings.aspectRatio === "number" && settings.aspectRatio > 0
        ? settings.aspectRatio
        : width > 0 && height > 0
          ? width / height
          : null;

    return {
      aspectRatio,
      height,
      width
    };
  } catch {
    return {
      aspectRatio: null,
      height: 0,
      width: 0
    };
  }
}

export function isStudioPortraitSafeCameraTrack(track: MediaStreamTrack | null): boolean {
  const shape = readStudioCameraSourceShape(track);

  if (!(shape.width > 0) || !(shape.height > 0)) {
    return false;
  }

  if (shape.height <= shape.width) {
    return false;
  }

  if (!(typeof shape.aspectRatio === "number") || !(shape.aspectRatio > 0)) {
    return false;
  }

  return shape.aspectRatio <= STUDIO_PORTRAIT_SAFE_MAX_ASPECT_RATIO;
}
