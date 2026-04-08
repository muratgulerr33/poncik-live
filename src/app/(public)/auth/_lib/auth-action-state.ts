export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle"
};
