import { NextRequest, NextResponse } from "next/server";

import { createLiveWatchViewerToken } from "@/app/(public)/live/[username]/_adapters/live-watch-viewer-token-boundary";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        username?: unknown;
      }
    | null;
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const result = await createLiveWatchViewerToken(username);

  if (result.kind === "success") {
    return NextResponse.json(result.payload);
  }

  if (result.kind === "invalid_request") {
    return NextResponse.json(
      {
        message: "Watch token su anda olusturulamiyor."
      },
      {
        status: 400
      }
    );
  }

  if (result.kind === "not_live") {
    return NextResponse.json(
      {
        message: "Watch token su anda olusturulamiyor."
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json(
    {
      message: "Watch token su anda olusturulamiyor."
    },
    {
      status: 503
    }
  );
}
