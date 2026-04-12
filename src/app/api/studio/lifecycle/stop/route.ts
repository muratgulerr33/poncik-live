import { NextResponse } from "next/server";

import { stopCurrentApprovedPublisherBroadcast } from "@/app/(studio)/studio/_adapters/studio-broadcast-stop-adapter";

export async function POST() {
  const result = await stopCurrentApprovedPublisherBroadcast();

  if (result.kind === "stopped" || result.kind === "noop") {
    return NextResponse.json({
      status: result.kind
    });
  }

  if (result.kind === "unauthorized") {
    return NextResponse.json(
      {
        status: "unauthorized"
      },
      {
        status: 401
      }
    );
  }

  return NextResponse.json(
    {
      status: "degraded"
    },
    {
      status: 503
    }
  );
}
