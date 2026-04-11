import "server-only";

export function getLiveKitBroadcastRoomName(accountId: string) {
  return `broadcast-${accountId}`;
}
