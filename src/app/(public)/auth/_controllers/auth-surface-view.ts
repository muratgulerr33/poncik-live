export type PublisherCoverCatalogItem = {
  id: string;
  storageKey: string;
  previewSrc: string;
  label: string;
  isSelected: boolean;
};

export type PublisherCoverCatalogState =
  | {
      kind: "ready" | "empty-selected";
      items: PublisherCoverCatalogItem[];
    }
  | {
      kind: "degraded";
    };

export type PublisherSurfaceView =
  | {
      kind: "pending_review";
      showContinuityHint: boolean;
    }
  | {
      kind: "approved";
      selectedCoverImageId: string | null;
      coverCatalogState: PublisherCoverCatalogState;
    }
  | {
      kind: "rejected";
    }
  | {
      kind: "missing" | "degraded";
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
