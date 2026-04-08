import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const publisherSettings = pgTable("publisher_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull(),
  coverImageId: uuid("cover_image_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
