import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  ndis_number: varchar("ndis_number", { length: 20 }),
  address: text("address"),
  suburb: varchar("suburb", { length: 100 }),
  weekday_code: text("weekday_code"),
  saturday_code: text("saturday_code"),
  sunday_code: text("sunday_code"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
