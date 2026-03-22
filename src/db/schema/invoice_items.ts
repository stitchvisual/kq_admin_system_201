import { pgTable, text, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { invoices } from "./invoices";
import { appointments } from "./appointments";

export const invoiceItems = pgTable("invoice_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  invoice_id: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  appointment_id: text("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  ndis_item_code: varchar("ndis_item_code", { length: 20 }),
  support_category: varchar("support_category", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;