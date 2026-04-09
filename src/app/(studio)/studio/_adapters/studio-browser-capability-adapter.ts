"use client";

export type StudioBrowserCapabilityState =
  | "ready_to_request_later"
  | "unsupported"
  | "not_ready"
  | "degraded";

export function readStudioBrowserCapabilityState(): StudioBrowserCapabilityState {
  try {
    if (typeof window === "undefined" || !window.isSecureContext) {
      return "not_ready";
    }

    if (!("mediaDevices" in navigator)) {
      return "unsupported";
    }

    if (typeof navigator.mediaDevices?.getUserMedia !== "function") {
      return "unsupported";
    }

    return "ready_to_request_later";
  } catch {
    return "degraded";
  }
}
