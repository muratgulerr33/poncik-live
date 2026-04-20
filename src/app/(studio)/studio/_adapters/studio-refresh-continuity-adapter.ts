"use client";

const STUDIO_REFRESH_CONTINUITY_MARKER_KEY =
  "studio:refresh-live-continuity";
const STUDIO_REFRESH_CONTINUITY_FRESHNESS_MS = 12000;

export type StudioRefreshContinuityMarker = {
  path: "/studio";
  timestamp: number;
};

export function clearStudioRefreshContinuityMarker() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STUDIO_REFRESH_CONTINUITY_MARKER_KEY);
  } catch {
    // Session storage continuity is best-effort only.
  }
}

export function readStudioRefreshContinuityMarker(): StudioRefreshContinuityMarker | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(
      STUDIO_REFRESH_CONTINUITY_MARKER_KEY
    );

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<StudioRefreshContinuityMarker>;

    if (parsed.path !== "/studio" || typeof parsed.timestamp !== "number") {
      return null;
    }

    return {
      path: "/studio",
      timestamp: parsed.timestamp
    };
  } catch {
    return null;
  }
}

export function writeStudioRefreshContinuityMarker() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const marker: StudioRefreshContinuityMarker = {
      path: "/studio",
      timestamp: Date.now()
    };

    window.sessionStorage.setItem(
      STUDIO_REFRESH_CONTINUITY_MARKER_KEY,
      JSON.stringify(marker)
    );
  } catch {
    // Session storage continuity is best-effort only.
  }
}

export function isFreshStudioRefreshContinuityMarker(
  marker: StudioRefreshContinuityMarker | null
) {
  if (!marker) {
    return false;
  }

  return Date.now() - marker.timestamp <= STUDIO_REFRESH_CONTINUITY_FRESHNESS_MS;
}

export function readStudioRefreshContinuityNavigationType() {
  if (typeof window === "undefined") {
    return null;
  }

  const navigationEntries = window.performance.getEntriesByType("navigation");
  const latestNavigation = navigationEntries[0];

  if (
    latestNavigation &&
    "type" in latestNavigation &&
    typeof latestNavigation.type === "string"
  ) {
    return latestNavigation.type;
  }

  const legacyNavigationType = window.performance.navigation?.type;

  if (legacyNavigationType === 1) {
    return "reload";
  }

  if (legacyNavigationType === 0) {
    return "navigate";
  }

  return null;
}
