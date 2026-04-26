import "server-only";

import { randomUUID } from "node:crypto";

import { AccessToken } from "livekit-server-sdk";

import { getLiveKitBroadcastRoomName } from "@/app/api/livekit/_lib/livekit-room-naming";
import { readWatchView } from "@/app/(public)/_lib/public-live-read";
import { readLiveWatchViewerWriteAccess } from "../_lib/live-watch-viewer-write-access";

type LiveWatchViewerTokenPayload = {
  participant_token: string;
  server_url: string;
};

export type LiveWatchViewerTokenResult =
  | {
      kind: "success";
      payload: LiveWatchViewerTokenPayload;
    }
  | {
      kind: "invalid_request" | "not_live" | "unavailable";
    };

function readLiveKitServerEnv() {
  const serverUrl = process.env.LIVEKIT_URL?.trim();
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();

  if (!serverUrl || !apiKey || !apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    serverUrl
  };
}

export async function createLiveWatchViewerToken(
  username: string
): Promise<LiveWatchViewerTokenResult> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return {
      kind: "invalid_request"
    };
  }

  const [viewerWriteAccess, view] = await Promise.all([
    readLiveWatchViewerWriteAccess(),
    readWatchView(normalizedUsername)
  ]);

  if (view.kind !== "live") {
    return {
      kind: "not_live"
    };
  }

  const env = readLiveKitServerEnv();

  if (!env) {
    return {
      kind: "unavailable"
    };
  }

  try {
    const token =
      viewerWriteAccess.kind === "viewer_write_allowed"
        ? new AccessToken(env.apiKey, env.apiSecret, {
            identity: `viewer-${viewerWriteAccess.accountId}`,
            name: viewerWriteAccess.username,
            ttl: "5m"
          })
        : new AccessToken(env.apiKey, env.apiSecret, {
            identity: `viewer-${randomUUID()}`,
            ttl: "5m"
          });

    token.addGrant({
      canPublish: false,
      canPublishData: viewerWriteAccess.kind === "viewer_write_allowed",
      canSubscribe: true,
      room: getLiveKitBroadcastRoomName(view.broadcasterAccountId),
      roomJoin: true
    });

    return {
      kind: "success",
      payload: {
        participant_token: await token.toJwt(),
        server_url: env.serverUrl
      }
    };
  } catch {
    return {
      kind: "unavailable"
    };
  }
}
