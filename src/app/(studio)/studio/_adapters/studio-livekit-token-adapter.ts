import "server-only";

import { AccessToken } from "livekit-server-sdk";

import { getLiveKitBroadcastRoomName } from "@/app/api/livekit/_lib/livekit-room-naming";
import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";

type StudioPublisherTokenPayload = {
  server_url: string;
  participant_token: string;
};

type StudioPublisherTokenResult =
  | {
      kind: "success";
      payload: StudioPublisherTokenPayload;
    }
  | {
      kind: "unauthorized" | "forbidden" | "unavailable";
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

function getPreferredPublisherIdentity(accountId: string) {
  return `publisher-${accountId}`;
}

export async function createStudioPublisherToken(): Promise<StudioPublisherTokenResult> {
  const sessionState = await readCurrentSessionState();

  if (sessionState.kind !== "authenticated") {
    return {
      kind: "unauthorized"
    };
  }

  if (sessionState.session.roleType !== "publisher") {
    return {
      kind: "forbidden"
    };
  }

  const applicationState = await readPublisherApplicationStatus(
    sessionState.session.accountId
  );

  if (applicationState.kind !== "found" || applicationState.status !== "approved") {
    return {
      kind: "forbidden"
    };
  }

  const env = readLiveKitServerEnv();

  if (!env) {
    return {
      kind: "unavailable"
    };
  }

  try {
    const token = new AccessToken(env.apiKey, env.apiSecret, {
      identity: getPreferredPublisherIdentity(sessionState.session.accountId),
      name: sessionState.session.username,
      ttl: "10m"
    });

    token.addGrant({
      room: getLiveKitBroadcastRoomName(sessionState.session.accountId),
      roomJoin: true,
      canPublish: true,
      canSubscribe: false
    });

    return {
      kind: "success",
      payload: {
        server_url: env.serverUrl,
        participant_token: await token.toJwt()
      }
    };
  } catch {
    return {
      kind: "unavailable"
    };
  }
}
