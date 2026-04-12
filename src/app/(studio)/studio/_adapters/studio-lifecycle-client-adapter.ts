"use client";

import {
  startBroadcastAction,
  stopBroadcastAction
} from "../_actions/studio-lifecycle-actions";

export async function startStudioBroadcastLifecycle() {
  return startBroadcastAction();
}

export async function stopStudioBroadcastLifecycle() {
  return stopBroadcastAction();
}

const STUDIO_CLOSE_STOP_ENDPOINT = "/api/studio/lifecycle/stop";

export function triggerStudioBroadcastCloseStop() {
  try {
    if (typeof navigator.sendBeacon === "function") {
      const didQueue = navigator.sendBeacon(STUDIO_CLOSE_STOP_ENDPOINT);

      if (didQueue) {
        return;
      }
    }
  } catch {
    // Best-effort close path should never throw into the UI lifecycle.
  }

  void fetch(STUDIO_CLOSE_STOP_ENDPOINT, {
    cache: "no-store",
    credentials: "same-origin",
    keepalive: true,
    method: "POST"
  }).catch(() => undefined);
}
