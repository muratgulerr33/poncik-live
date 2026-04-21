"use client";

export type StudioPreviewState =
  | "requesting"
  | "preview_ready"
  | "blocked"
  | "unsupported"
  | "timeout"
  | "degraded";

export type StudioPreviewRequestResult =
  | {
      kind: "success";
      stream: MediaStream;
    }
  | {
      kind: "blocked";
    }
  | {
      kind: "unsupported";
    }
  | {
      kind: "degraded";
    };

export type StudioCameraFacingMode = "user" | "environment" | "left" | "right";

export type StudioCameraConstraintTarget = Readonly<{
  deviceId?: string;
  facingMode?: StudioCameraFacingMode;
}>;

export type StudioViableCameraDevice = Readonly<{
  deviceId: string;
  groupId: string;
  label: string;
}>;

function canRequestStudioMedia() {
  const allowInsecureLanMediaDev =
    process.env.NEXT_PUBLIC_ALLOW_INSECURE_LAN_MEDIA_DEV === "1";
  const isDev = process.env.NODE_ENV === "development";

  if (
    typeof window === "undefined" ||
    (!window.isSecureContext && !(isDev && allowInsecureLanMediaDev))
  ) {
    return false;
  }

  return (
    "mediaDevices" in navigator &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

function isStudioUnsupportedMediaError(error: unknown) {
  return (
    error instanceof DOMException &&
    ["NotFoundError", "OverconstrainedError", "SecurityError"].includes(error.name)
  );
}

function isStudioBlockedMediaError(error: unknown) {
  return (
    error instanceof DOMException &&
    ["NotAllowedError", "PermissionDeniedError"].includes(error.name)
  );
}

async function requestStudioMediaStream(
  constraints: MediaStreamConstraints
): Promise<StudioPreviewRequestResult> {
  try {
    if (!canRequestStudioMedia()) {
      return {
        kind: "unsupported"
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    return {
      kind: "success",
      stream
    };
  } catch (error) {
    if (isStudioBlockedMediaError(error)) {
      return {
        kind: "blocked"
      };
    }

    if (isStudioUnsupportedMediaError(error)) {
      return {
        kind: "unsupported"
      };
    }

    return {
      kind: "degraded"
    };
  }
}

export async function requestStudioPreviewStream(): Promise<StudioPreviewRequestResult> {
  return requestStudioMediaStream({
    video: true,
    audio: true
  });
}

export async function requestStudioTargetedCameraStream(
  target: StudioCameraConstraintTarget
): Promise<StudioPreviewRequestResult> {
  const videoConstraint =
    target.deviceId || target.facingMode
      ? {
          ...(target.deviceId
            ? {
                deviceId: {
                  exact: target.deviceId
                }
              }
            : {}),
          ...(target.facingMode
            ? {
                facingMode: {
                  exact: target.facingMode
                }
              }
            : {})
        }
      : true;

  return requestStudioMediaStream({
    video: videoConstraint,
    audio: false
  });
}

export async function readStudioViableCameraDevices({
  activeDeviceId = null
}: Readonly<{
  activeDeviceId?: string | null;
}> = {}): Promise<StudioViableCameraDevice[]> {
  if (
    !canRequestStudioMedia() ||
    typeof navigator.mediaDevices?.enumerateDevices !== "function"
  ) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const seenDeviceIds = new Set<string>();
  const viableDevices: StudioViableCameraDevice[] = [];

  for (const device of devices) {
    if (device.kind !== "videoinput" || !device.deviceId || seenDeviceIds.has(device.deviceId)) {
      continue;
    }

    seenDeviceIds.add(device.deviceId);

    if (device.deviceId === activeDeviceId) {
      viableDevices.push({
        deviceId: device.deviceId,
        groupId: device.groupId,
        label: device.label
      });
      continue;
    }

    const result = await requestStudioTargetedCameraStream({
      deviceId: device.deviceId
    });

    if (result.kind !== "success") {
      continue;
    }

    stopStudioPreviewStream(result.stream);
    viableDevices.push({
      deviceId: device.deviceId,
      groupId: device.groupId,
      label: device.label
    });
  }

  return viableDevices;
}

export async function attachStudioPreviewStream(
  videoElement: HTMLVideoElement,
  stream: MediaStream
) {
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.autoplay = true;
  videoElement.srcObject = stream;

  try {
    await videoElement.play();
    return true;
  } catch {
    return false;
  }
}

export function stopStudioPreviewStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}
