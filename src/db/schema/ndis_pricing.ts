import { pgTable, text, timestamp, varchar, numeric } from "drizzle-orm/pg-core";

export const ndisPricing = pgTable("ndis_pricing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  category: varchar("category", { length: 100 }).notNull(),
  support_item_code: varchar("support_item_code", { length: 50 }).notNull().unique(),
  support_item_name: varchar("support_item_name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  national_price: numeric("national_price", { precision: 10, scale: 2 }),
  remote_price: numeric("remote_price", { precision: 10, scale: 2 }),
  very_remote_price: numeric("very_remote_price", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type NdisPricing = typeof ndisPricing.$inferSelect;
export type NewNdisPricing = typeof ndisPricing.$inferInsert;
