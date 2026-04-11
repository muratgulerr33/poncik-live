"use client";

export type StudioBrowserCapabilityState =
  | "requestable"
  | "unsupported"
  | "degraded";

export function readStudioBrowserCapabilityState(): StudioBrowserCapabilityState {
  try {
    const allowInsecureLanMediaDev =
      process.env.NEXT_PUBLIC_ALLOW_INSECURE_LAN_MEDIA_DEV === "1";
    const isDev = process.env.NODE_ENV === "development";

    if (
      typeof window === "undefined" ||
      (!window.isSecureContext && !(isDev && allowInsecureLanMediaDev))
    ) {
      return "unsupported";
    }

    if (!("mediaDevices" in navigator)) {
      return "unsupported";
    }

    if (typeof navigator.mediaDevices?.getUserMedia !== "function") {
      return "unsupported";
    }

    return "requestable";
  } catch {
    return "degraded";
  }
}
