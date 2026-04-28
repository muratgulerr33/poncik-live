export type LiveWatchGuestAuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const INITIAL_LIVE_WATCH_GUEST_AUTH_ACTION_STATE: LiveWatchGuestAuthActionState =
  {
    status: "idle"
  };
