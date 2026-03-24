import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tag: varchar("tag", { length: 50 }).notNull().default('Community'), // Social, Workshop, Outing, Creative, Wellness, Community
  event_date: timestamp("event_date").notNull(),
  end_date: timestamp("end_date"), // For multi-day events
  time: text("time").notNull(), // e.g., "10:00 am - 12:00 pm"
  location: text("location").notNull(),
  image_url: text("image_url"), // Optional featured image
  is_published: boolean("is_published").notNull().default(false),
  show_on_home: boolean("show_on_home").notNull().default(true), // Show on homepage
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;