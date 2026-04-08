import { randomBytes } from "node:crypto";

import { deleteSessionByToken } from "./auth-session-boundary";
import { writeSessionCookie } from "./auth-cookie-boundary";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type RegisterSessionSeed = {
  sessionToken: string;
  expiresAt: Date;
};

export function createRegisterSessionSeed(): RegisterSessionSeed {
  return {
    sessionToken: randomBytes(24).toString("hex"),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
  };
}

export async function persistRegisterSession(seed: RegisterSessionSeed) {
  try {
    await writeSessionCookie(seed.sessionToken, seed.expiresAt);

    return {
      ok: true as const
    };
  } catch {
    await deleteSessionByToken(seed.sessionToken);

    return {
      ok: false as const
    };
  }
}
