import { readCurrentSession } from "../_adapters/auth-session-adapter";
import { resolveAuthContinuation } from "../_lib/auth-continuation";

type AuthCoreControllerInput = Readonly<{
  next: string | null | undefined;
}>;

export async function getAuthCoreView(input: AuthCoreControllerInput) {
  const sessionState = await readCurrentSession();
  const continuation = resolveAuthContinuation(input.next);

  return {
    currentSession:
      sessionState.kind === "authenticated" ? sessionState.session : null,
    degradedMessage:
      sessionState.kind === "degraded"
        ? "Giriş işlemleri şu anda tamamlanamıyor. Lütfen biraz sonra tekrar dene."
        : null,
    continuation
  };
}
