export function getPublicLivePath(username: string) {
  return `/live/${encodeURIComponent(username)}`;
}
