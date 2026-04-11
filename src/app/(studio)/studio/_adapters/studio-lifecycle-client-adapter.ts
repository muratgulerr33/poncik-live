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
