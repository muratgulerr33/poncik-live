export type PublisherSurfaceView =
  | {
      kind: "pending_review" | "approved" | "rejected" | "missing" | "degraded";
      showContinuityHint: boolean;
    }
  | null;

export type AdminSurfaceView =
  | {
      kind: "queue";
      items: {
        id: string;
        accountId: string;
        fullName: string;
        phone: string;
        email: string;
        username: string;
        createdAtLabel: string;
      }[];
    }
  | {
      kind: "empty";
    }
  | {
      kind: "degraded";
    }
  | null;
