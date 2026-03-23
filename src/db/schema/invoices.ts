import { pgTable, text, timestamp, varchar, numeric } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { clients } from './clients';

export const invoices = pgTable('invoices', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull().unique(),
  client_id: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  invoice_date: timestamp('invoice_date').defaultNow().notNull(),
  due_date: timestamp('due_date').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).default('0').notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  notes: text('notes'),
  service_period_start: timestamp('service_period_start'),
  service_period_end: timestamp('service_period_end'),
  issued_at: timestamp('issued_at'),
  paid_at: timestamp('paid_at'),
  emailed_at: timestamp('emailed_at'),
  resend_email_id: text('resend_email_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  deleted_at: timestamp('deleted_at'),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;