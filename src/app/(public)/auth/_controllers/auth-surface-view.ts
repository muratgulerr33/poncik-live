export type AdminApprovalStatusFilter =
  | "pending_review"
  | "approved"
  | "rejected"
  | "all";

export type AuthSelectedSurface = "account" | "settings";

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
      selectedFilter: AdminApprovalStatusFilter;
      isReadOnly: boolean;
      items: {
        id: string;
        accountId: string;
        fullName: string;
        phone: string;
        email: string;
        username: string;
        status: "pending_review" | "approved" | "rejected";
        createdAtLabel: string;
      }[];
    }
  | {
      kind: "empty";
      selectedFilter: AdminApprovalStatusFilter;
    }
  | {
      kind: "degraded";
      selectedFilter: AdminApprovalStatusFilter;
    }
  | null;
