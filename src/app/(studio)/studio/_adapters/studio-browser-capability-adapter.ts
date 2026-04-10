"use client";

export type StudioBrowserCapabilityState =
  | "requestable"
  | "unsupported"
  | "degraded";

export function readStudioBrowserCapabilityState(): StudioBrowserCapabilityState {
  try {
    if (typeof window === "undefined" || !window.isSecureContext) {
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
