import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const coverImages = pgTable("cover_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  storageKey: text("storage_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
