export type StudioPublisherGateKind =
  | "pending_review"
  | "rejected"
  | "missing_degraded";

export type StudioPrepView =
  | {
      kind: "redirect_auth";
    }
  | {
      kind: "session_degraded_gate";
    }
  | {
      kind: "wrong_role";
      roleType: string;
    }
  | {
      kind: "publisher_gate";
      gateKind: StudioPublisherGateKind;
    }
  | {
      kind: "approved_prep";
      session: {
        accountId: string;
        username: string;
        email: string;
      };
    };
