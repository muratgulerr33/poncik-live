"use client";

type LiveWatchViewerTokenPayload = {
  participant_token: string;
  server_url: string;
};

export type LiveWatchViewerTokenFetchResult =
  | {
      kind: "success";
      payload: LiveWatchViewerTokenPayload;
    }
  | {
      kind: "not_live" | "degraded";
    };

export async function fetchLiveWatchViewerToken(
  username: string
): Promise<LiveWatchViewerTokenFetchResult> {
  try {
    const response = await fetch("/api/livekit/viewer-token", {
      body: JSON.stringify({
        username
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          kind: "not_live"
        };
      }

      return {
        kind: "degraded"
      };
    }

    const body = (await response.json()) as Partial<LiveWatchViewerTokenPayload>;

    if (
      typeof body.server_url !== "string" ||
      typeof body.participant_token !== "string"
    ) {
      return {
        kind: "degraded"
      };
    }

    return {
      kind: "success",
      payload: {
        participant_token: body.participant_token,
        server_url: body.server_url
      }
    };
  } catch {
    return {
      kind: "degraded"
    };
  }
}
