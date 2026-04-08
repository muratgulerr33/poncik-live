const DEFAULT_AUTH_DESTINATION = "/";

function normalizeNextValue(nextValue: string | null | undefined) {
  if (!nextValue) {
    return null;
  }

  const trimmed = nextValue.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed === "/auth" || trimmed.startsWith("/auth?")) {
    return null;
  }

  return trimmed;
}

export function resolveAuthContinuation(nextValue: string | null | undefined) {
  const continuationPath = normalizeNextValue(nextValue);

  return {
    continuationPath,
    destination: continuationPath ?? DEFAULT_AUTH_DESTINATION
  };
}
