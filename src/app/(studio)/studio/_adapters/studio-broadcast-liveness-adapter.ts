import "server-only";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { RoomServiceClient } from "livekit-server-sdk";

import { getLiveKitBroadcastRoomName } from "@/app/api/livekit/_lib/livekit-room-naming";
import { getPublicLivePath } from "@/app/(public)/_lib/public-live-path";
import { getDb } from "@/db/client";
import { broadcasts } from "@/db/schema";

const LIVE_STATUS = "live";
const ENDED_STATUS = "ended";
const STUDIO_CLOSE_RECONCILIATION_GRACE_MS = 15000;

export type StudioBroadcastLivenessCandidate = {
  broadcastId: string;
  publisherAccountId: string;
  updatedAt: Date;
  username: string;
};

type StudioBroadcastLivenessResult =
  | {
      kind: "keep_live";
    }
  | {
      kind: "ended";
    };

type PublisherPresenceResult =
  | {
      kind: "present";
    }
  | {
      kind: "absent";
    }
  | {
      kind: "degraded";
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

function getPublisherIdentity(accountId: string) {
  return `publisher-${accountId}`;
}

function hasGraceExpired(updatedAt: Date) {
  return Date.now() - updatedAt.getTime() > STUDIO_CLOSE_RECONCILIATION_GRACE_MS;
}

function revalidateStudioLifecyclePaths(username: string) {
  revalidatePath("/studio");
  revalidatePath("/");
  revalidatePath(getPublicLivePath(username));
}

async function readPublisherPresence(
  candidate: StudioBroadcastLivenessCandidate
): Promise<PublisherPresenceResult> {
  const env = readLiveKitServerEnv();

  if (!env) {
    return {
      kind: "degraded"
    };
  }

  try {
    const roomService = new RoomServiceClient(
      env.serverUrl,
      env.apiKey,
      env.apiSecret
    );
    const roomName = getLiveKitBroadcastRoomName(candidate.publisherAccountId);
    const publisherIdentity = getPublisherIdentity(candidate.publisherAccountId);
    const rooms = await roomService.listRooms([roomName]);

    if (rooms.length === 0) {
      return {
        kind: "absent"
      };
    }

    const participants = await roomService.listParticipants(roomName);
    const isPublisherPresent = participants.some(
      (participant) => participant.identity === publisherIdentity
    );

    return isPublisherPresent
      ? {
          kind: "present"
        }
      : {
          kind: "absent"
        };
  } catch {
    return {
      kind: "degraded"
    };
  }
}

async function markBroadcastEndedIfStillLive(
  candidate: StudioBroadcastLivenessCandidate
): Promise<StudioBroadcastLivenessResult> {
  try {
    const db = getDb();
    const now = new Date();
    const endedRows = await db
      .update(broadcasts)
      .set({
        status: ENDED_STATUS,
        endedAt: now,
        updatedAt: now
      })
      .where(
        and(
          eq(broadcasts.id, candidate.broadcastId),
          eq(broadcasts.status, LIVE_STATUS)
        )
      )
      .returning({
        id: broadcasts.id
      });

    if (endedRows[0]) {
      revalidateStudioLifecyclePaths(candidate.username);

      return {
        kind: "ended"
      };
    }
  } catch {
    return {
      kind: "keep_live"
    };
  }

  return {
    kind: "keep_live"
  };
}

async function reconcileCandidateLiveBroadcast(
  candidate: StudioBroadcastLivenessCandidate
): Promise<StudioBroadcastLivenessResult> {
  const presenceResult = await readPublisherPresence(candidate);

  if (presenceResult.kind !== "absent") {
    return {
      kind: "keep_live"
    };
  }

  if (!hasGraceExpired(candidate.updatedAt)) {
    return {
      kind: "keep_live"
    };
  }

  return markBroadcastEndedIfStillLive(candidate);
}

export function createStudioBroadcastLivenessReconciler() {
  const reconcileMemo = new Map<string, Promise<StudioBroadcastLivenessResult>>();

  return async function resolveStudioBroadcastLiveness(
    candidate: StudioBroadcastLivenessCandidate
  ): Promise<StudioBroadcastLivenessResult> {
    const existingResult = reconcileMemo.get(candidate.broadcastId);

    if (existingResult) {
      return existingResult;
    }

    const resultPromise = reconcileCandidateLiveBroadcast(candidate);
    reconcileMemo.set(candidate.broadcastId, resultPromise);
    return resultPromise;
  };
}
