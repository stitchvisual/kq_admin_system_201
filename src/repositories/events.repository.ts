import { db } from '@/db';
import { events, type Event, type NewEvent } from '@/db/schema/events';
import { eq, isNull, ilike, and, desc, asc, gte, lte, or } from 'drizzle-orm';

export const eventsRepository = {
  async findAll(options?: {
    search?: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
    upcomingOnly?: boolean;
  }): Promise<Event[]> {
    const {
      search,
      page = 1,
      limit = 50,
      publishedOnly = false,
      upcomingOnly = false,
    } = options || {};

    const conditions = [isNull(events.deleted_at)];

    if (search) {
      conditions.push(ilike(events.title, `%${search}%`));
    }

    if (publishedOnly) {
      conditions.push(eq(events.is_published, true));
    }

    if (upcomingOnly) {
      conditions.push(gte(events.event_date, new Date()));
    }

    const offset = (page - 1) * limit;
    return db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(asc(events.event_date))
      .limit(limit)
      .offset(offset);
  },

  async count(options?: { search?: string; publishedOnly?: boolean }): Promise<number> {
    const { search, publishedOnly = false } = options || {};

    const conditions = [isNull(events.deleted_at)];

    if (search) {
      conditions.push(ilike(events.title, `%${search}%`));
    }

    if (publishedOnly) {
      conditions.push(eq(events.is_published, true));
    }

    const results = await db
      .select()
      .from(events)
      .where(and(...conditions));

    return results.length;
  },

  async findById(id: string): Promise<Event | null> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deleted_at)));

    return event ?? null;
  },

  async create(data: NewEvent): Promise<Event> {
    const [event] = await db.insert(events).values(data).returning();
    return event;
  },

  async update(id: string, data: Partial<NewEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...data, updated_at: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(events)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(events.id, id));
  },

  async getPublishedUpcoming(limit: number = 10): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.is_published, true),
          gte(events.event_date, new Date()),
          isNull(events.deleted_at)
        )
      )
      .orderBy(asc(events.event_date))
      .limit(limit);
  },

  async getPublishedForHome(limit: number = 6): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.is_published, true),
          eq(events.show_on_home, true),
          gte(events.event_date, new Date()),
          isNull(events.deleted_at)
        )
      )
      .orderBy(asc(events.event_date))
      .limit(limit);
  },
};