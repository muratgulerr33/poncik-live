import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const publisherApplications = pgTable("publisher_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
