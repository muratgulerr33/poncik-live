"use client";

export type StudioPreviewState =
  | "requesting"
  | "preview_ready"
  | "denied"
  | "unsupported"
  | "timeout"
  | "degraded";

export type StudioPreviewRequestResult =
  | {
      kind: "success";
      stream: MediaStream;
    }
  | {
      kind: "denied";
    }
  | {
      kind: "unsupported";
    }
  | {
      kind: "degraded";
    };

export async function requestStudioPreviewStream(): Promise<StudioPreviewRequestResult> {
  try {
    if (typeof window === "undefined" || !window.isSecureContext) {
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
        kind: "denied"
      };
    }

    if (
      error instanceof DOMException &&
      ["NotFoundError", "NotReadableError", "AbortError"].includes(error.name)
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
