import { NextResponse } from "next/server";

import { readPublisherApplicationStatus } from "@/app/(public)/auth/_adapters/auth-publisher-application-boundary";
import { readCurrentSessionState } from "@/app/(public)/auth/_adapters/auth-session-boundary";
import { markBroadcastCloseCandidateForPublisher } from "@/app/(studio)/studio/_adapters/studio-broadcast-adapter";

async function readApprovedPublisherSession() {
  const sessionState = await readCurrentSessionState();

  if (
    sessionState.kind !== "authenticated" ||
    sessionState.session.roleType !== "publisher"
  ) {
    return null;
  }

  const applicationState = await readPublisherApplicationStatus(
    sessionState.session.accountId
  );

  if (applicationState.kind !== "found" || applicationState.status !== "approved") {
    return null;
  }

  return sessionState.session;
}

export async function POST() {
  try {
    const session = await readApprovedPublisherSession();

    if (!session) {
      return NextResponse.json(
        {
          status: "unauthorized"
        },
        {
          status: 401
        }
      );
    }

    const result = await markBroadcastCloseCandidateForPublisher(session.accountId);

    return NextResponse.json({
      status: result.kind
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded"
      },
      {
        status: 503
      }
    );
  }
}
