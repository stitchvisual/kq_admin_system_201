import { pgTable, text, timestamp, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { clients } from "./clients";

export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const appointments = pgTable("appointments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  client_id: text("client_id")
    .references(() => clients.id, { onDelete: "cascade" }), // Nullable for group appointments
  title: text("title"),
  starts_at: timestamp("starts_at").notNull(),
  ends_at: timestamp("ends_at").notNull(),
  status: appointmentStatus("status").default("confirmed").notNull(),
  notes: text("notes"),
  invoiced: boolean("invoiced").default(false).notNull(),
  invoice_ref: text("invoice_ref"),
  is_group: boolean("is_group").default(false).notNull(),
  group_size: integer("group_size").default(1).notNull(),
  rate_code: text("rate_code"), // NDIS rate code for this appointment
  travel_km: numeric("travel_km", { precision: 10, scale: 2 }), // Travel distance in kilometers
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});

// Junction table for group appointment participants
export const appointmentParticipants = pgTable("appointment_participants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  appointment_id: text("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  client_id: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  split_rate: numeric("split_rate", { precision: 10, scale: 6 }).notNull(), // Fraction of total rate (1/group_size, e.g., 0.333333 for 3 participants)
  invoiced: boolean("invoiced").default(false).notNull(),
  invoice_ref: text("invoice_ref"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type AppointmentParticipant = typeof appointmentParticipants.$inferSelect;
export type NewAppointmentParticipant = typeof appointmentParticipants.$inferInsert;