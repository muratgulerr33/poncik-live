"use client";

import {
  createStudioMobilePortraitCaptureConstraints,
  isStudioPortraitSafeCameraTrack,
  shouldUseStudioMobilePortraitCaptureContract
} from "./studio-camera-capture-contract";

const STUDIO_CAMERA_RELEASE_SETTLE_MS = 150;

export type StudioCameraDeviceDescriptor = {
  deviceId: string;
  groupId: string;
  label: string;
};

export type StudioCameraDeviceReadResult =
  | { kind: "success"; devices: StudioCameraDeviceDescriptor[] }
  | { kind: "unsupported" }
  | { kind: "degraded" };

export type StudioCameraStreamRequestResult =
  | { kind: "success"; stream: MediaStream }
  | { kind: "blocked" }
  | { kind: "unsupported" }
  | { kind: "not_readable" }
  | { kind: "degraded" };

function isStudioCameraConstraintCompatibilityError(error: unknown) {
  if (error instanceof TypeError) {
    return true;
  }

  return (
    error instanceof DOMException &&
    ["OverconstrainedError", "ConstraintNotSatisfiedError"].includes(error.name)
  );
}

function mapStudioCameraRequestError(error: unknown): StudioCameraStreamRequestResult {
  if (
    error instanceof DOMException &&
    ["NotAllowedError", "PermissionDeniedError"].includes(error.name)
  ) {
    return { kind: "blocked" };
  }

  if (
    error instanceof DOMException &&
    ["NotFoundError", "OverconstrainedError", "SecurityError"].includes(error.name)
  ) {
    return { kind: "unsupported" };
  }

  if (error instanceof DOMException && error.name === "NotReadableError") {
    return { kind: "not_readable" };
  }

  return { kind: "degraded" };
}

function readStudioMediaDevices() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const mediaDevices = navigator.mediaDevices;

  if (!mediaDevices) {
    return null;
  }

  return mediaDevices;
}

async function requestStudioCameraLegacyStreamByDeviceId(input: {
  deviceId: string;
  includeAudio: boolean;
}): Promise<StudioCameraStreamRequestResult> {
  const mediaDevices = readStudioMediaDevices();

  if (!mediaDevices || typeof mediaDevices.getUserMedia !== "function") {
    return { kind: "unsupported" };
  }

  try {
    const stream = await mediaDevices.getUserMedia({
      audio: input.includeAudio,
      video: {
        deviceId: {
          exact: input.deviceId
        }
      }
    });

    return { kind: "success", stream };
  } catch (error) {
    return mapStudioCameraRequestError(error);
  }
}

export async function readStudioVideoInputDevices(): Promise<StudioCameraDeviceReadResult> {
  const mediaDevices = readStudioMediaDevices();

  if (!mediaDevices || typeof mediaDevices.enumerateDevices !== "function") {
    return { kind: "unsupported" };
  }

  try {
    const devices = await mediaDevices.enumerateDevices();

    return {
      kind: "success",
      devices: devices
        .filter((device) => device.kind === "videoinput" && device.deviceId.trim() !== "")
        .map((device) => ({
          deviceId: device.deviceId,
          groupId: device.groupId,
          label: device.label
        }))
    };
  } catch {
    return { kind: "degraded" };
  }
}

export function readStudioActiveVideoDeviceId(
  stream: MediaStream | null | undefined
): string | null {
  if (!stream) {
    return null;
  }

  try {
    const track =
      stream
        .getVideoTracks()
        .find((candidate) => candidate.readyState !== "ended") ?? null;

    if (!track) {
      return null;
    }

    const deviceId = track.getSettings().deviceId;

    return typeof deviceId === "string" && deviceId.trim() !== "" ? deviceId : null;
  } catch {
    return null;
  }
}

export function resolveStudioDefaultFrontCamera(
  devices: StudioCameraDeviceDescriptor[]
): StudioCameraDeviceDescriptor | null {
  const exactMatch = devices.find((device) => {
    const label = device.label.toLowerCase();

    return (
      label.includes("front") ||
      label.includes("user") ||
      label.includes("camera 1")
    );
  });

  return exactMatch ?? devices[0] ?? null;
}

export function resolveStudioNextCameraDevice(
  devices: StudioCameraDeviceDescriptor[],
  currentDeviceId: string | null
): StudioCameraDeviceDescriptor | null {
  if (!currentDeviceId) {
    return resolveStudioDefaultFrontCamera(devices);
  }

  return devices.find((device) => device.deviceId !== currentDeviceId) ?? null;
}

export async function requestStudioCameraStreamByDeviceId(input: {
  deviceId: string;
  includeAudio: boolean;
}): Promise<StudioCameraStreamRequestResult> {
  const mediaDevices = readStudioMediaDevices();

  if (!mediaDevices || typeof mediaDevices.getUserMedia !== "function") {
    return { kind: "unsupported" };
  }

  if (!shouldUseStudioMobilePortraitCaptureContract()) {
    return await requestStudioCameraLegacyStreamByDeviceId(input);
  }

  try {
    const stream = await mediaDevices.getUserMedia({
      audio: input.includeAudio,
      video: createStudioMobilePortraitCaptureConstraints({
        deviceId: input.deviceId
      })
    });
    const videoTrack =
      stream
        .getVideoTracks()
        .find((track) => track.readyState !== "ended") ?? null;

    if (isStudioPortraitSafeCameraTrack(videoTrack)) {
      return { kind: "success", stream };
    }

    stopStudioMediaStream(stream);
    return await requestStudioCameraLegacyStreamByDeviceId(input);
  } catch (error) {
    if (
      error instanceof DOMException &&
      ["NotAllowedError", "PermissionDeniedError"].includes(error.name)
    ) {
      return { kind: "blocked" };
    }

    if (error instanceof DOMException && error.name === "NotReadableError") {
      return { kind: "not_readable" };
    }

    if (isStudioCameraConstraintCompatibilityError(error)) {
      return await requestStudioCameraLegacyStreamByDeviceId(input);
    }

    return mapStudioCameraRequestError(error);
  }
}

export function stopStudioMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) {
    return;
  }

  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        return;
      }
    });
  } catch {
    return;
  }
}

export function stopStudioVideoTracks(stream: MediaStream | null | undefined): void {
  if (!stream) {
    return;
  }

  try {
    stream.getVideoTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        return;
      }
    });
  } catch {
    return;
  }
}

export function createStudioStreamWithReplacedVideo(input: {
  currentStream: MediaStream;
  nextVideoStream: MediaStream;
}): MediaStream {
  const preservedNonVideoTracks = input.currentStream
    .getTracks()
    .filter((track) => track.kind !== "video" && track.readyState !== "ended");
  const nextVideoTracks = input.nextVideoStream
    .getVideoTracks()
    .filter((track) => track.readyState !== "ended");

  return new MediaStream([...preservedNonVideoTracks, ...nextVideoTracks]);
}

export async function waitStudioCameraReleaseSettle(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, STUDIO_CAMERA_RELEASE_SETTLE_MS);
  });
}
