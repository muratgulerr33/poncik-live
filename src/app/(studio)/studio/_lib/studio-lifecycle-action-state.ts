export type StudioLifecycleActionState =
  | {
      status: "idle";
    }
  | {
      status: "error";
      message: string;
    };

export const INITIAL_STUDIO_LIFECYCLE_ACTION_STATE: StudioLifecycleActionState = {
  status: "idle"
};
