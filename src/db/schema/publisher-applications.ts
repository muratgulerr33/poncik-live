import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const publisherApplications = pgTable(
  "publisher_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [unique("publisher_applications_account_id_unique").on(table.accountId)]
);
