import { NextResponse } from "next/server";

import { createStudioPublisherToken } from "@/app/(studio)/studio/_adapters/studio-livekit-token-adapter";

export async function POST() {
  const result = await createStudioPublisherToken();

  if (result.kind === "success") {
    return NextResponse.json(result.payload);
  }

  if (result.kind === "unauthorized") {
    return NextResponse.json(
      {
        message: "Publish token su anda olusturulamiyor."
      },
      {
        status: 401
      }
    );
  }

  if (result.kind === "forbidden") {
    return NextResponse.json(
      {
        message: "Publish token su anda olusturulamiyor."
      },
      {
        status: 403
      }
    );
  }

  return NextResponse.json(
    {
      message: "Publish token su anda olusturulamiyor."
    },
    {
      status: 503
    }
  );
}
