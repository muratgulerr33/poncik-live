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

export async function requestStudioPreviewStream(): Promise<StudioPreviewRequestResult> {
  try {
    const allowInsecureLanMediaDev =
      process.env.NEXT_PUBLIC_ALLOW_INSECURE_LAN_MEDIA_DEV === "1";
    const isDev = process.env.NODE_ENV === "development";

    if (
      typeof window === "undefined" ||
      (!window.isSecureContext && !(isDev && allowInsecureLanMediaDev))
    ) {
      return {
        kind: "unsupported"
      };
    }

    if (
      !("mediaDevices" in navigator) ||
      typeof navigator.mediaDevices?.getUserMedia !== "function"
    ) {
      return {
        kind: "unsupported"
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    return {
      kind: "success",
      stream
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      ["NotAllowedError", "PermissionDeniedError"].includes(error.name)
    ) {
      return {
        kind: "blocked"
      };
    }

    if (
      error instanceof DOMException &&
      ["NotFoundError", "OverconstrainedError", "SecurityError"].includes(error.name)
    ) {
      return {
        kind: "unsupported"
      };
    }

    return {
      kind: "degraded"
    };
  }
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

export function getStudioPreviewMicrophoneTrack(
  stream: MediaStream | null | undefined
) {
  if (!stream) {
    return null;
  }

  return (
    stream
      .getAudioTracks()
      .find((track) => track.readyState !== "ended") ?? null
  );
}

export function readStudioPreviewMicrophoneState(
  stream: MediaStream | null | undefined
) {
  const track = getStudioPreviewMicrophoneTrack(stream);

  if (!track) {
    return {
      isAvailable: false,
      isMuted: false
    };
  }

  return {
    isAvailable: true,
    isMuted: !track.enabled
  };
}

export function setStudioPreviewMicrophoneMuted(
  stream: MediaStream | null | undefined,
  muted: boolean
) {
  const track = getStudioPreviewMicrophoneTrack(stream);

  if (!track) {
    return false;
  }

  track.enabled = !muted;
  return track.enabled === !muted;
}
