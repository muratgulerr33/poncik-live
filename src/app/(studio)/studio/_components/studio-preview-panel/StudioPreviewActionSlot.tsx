"use client";

import type { ReactNode } from "react";

import styles from "../studio-preview-panel.module.css";

type StudioPreviewActionSlotProps = Readonly<{
  children: ReactNode;
}>;

export function StudioPreviewActionSlot({
  children
}: StudioPreviewActionSlotProps) {
  return (
    <div className={styles.sceneActionSurface}>
      <div className={styles.sceneActionBudget}>{children}</div>
    </div>
  );
}
