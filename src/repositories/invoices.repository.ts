import { db } from '@/db';
import { invoices, invoiceItems, appointments, clients, ndisPricing, appointmentParticipants } from '@/db/schema';
import { eq, and, gte, lte, lt, isNull, desc, inArray, isNotNull, count, sql } from 'drizzle-orm';
import type { Invoice, NewInvoice } from '@/db/schema/invoices';
import type { InvoiceItem, NewInvoiceItem } from '@/db/schema/invoice_items';
import { appointmentsRepository } from './appointments.repository';

export type NewInvoiceItemInput = {
  appointment_id?: string | null;
  description: string;
  quantity: string;
  unit_price: string;
  ndis_item_code?: string | null;
  support_category?: string | null;
};

export type InvoiceWithClient = Invoice & {
  client: {
    id: string;
    name: string;
    ndis_number: string | null;
    address: string | null;
    suburb: string | null;
    email: string | null;
  };
  items?: InvoiceItem[];
};

export type UninvoicedSession = {
  id: string;
  client_id: string;
  client_name: string;
  starts_at: Date | string;  // Allow string for API responses
  ends_at: Date | string;     // Allow string for API responses
  duration_hours: number;
  ndis_code: string;
  rate: number;
  day_of_week: number;
  travel_km: number | null;
  /** Present for group appointments: this client's share of the hourly NDIS rate (cents) */
  is_group_share?: boolean;
  /** Number of participants in the group session (equal split) */
  group_participant_count?: number;
  /** Full NDIS hourly rate in cents before ÷ participants */
  full_ndis_hourly_rate_cents?: number;
};

export type ClientSessionGroup = {
  client_id: string;
  client_name: string;
  is_group: boolean;
  sessions: UninvoicedSession[];
  total_sessions: number;
  total_hours: number;
  estimated_total: number;
};

/** NDIS support item for session day from client weekday / Saturday / Sunday fields */
function ndisCodeForDayOfWeek(
  dayOfWeek: number,
  codes: {
    weekday_code: string | null;
    saturday_code: string | null;
    sunday_code: string | null;
  },
): string | null {
  if (dayOfWeek === 0 && codes.sunday_code) return codes.sunday_code.trim();
  if (dayOfWeek === 6 && codes.saturday_code) return codes.saturday_code.trim();
  return codes.weekday_code?.trim() || null;
}

function getPriceCents(priceMap: Map<string, number>, code: string | null | undefined): number {
  if (!code) return 0;
  const t = code.trim();
  if (!t) return 0;
  const direct = priceMap.get(t);
  if (direct !== undefined && direct > 0) return direct;
  // Case / whitespace drift between appointment and pricing table
  const lower = t.toLowerCase();
  for (const [k, v] of priceMap) {
    if (k.toLowerCase() === lower && v > 0) return v;
  }
  return 0;
}

/** NDIS national_price from DB (numeric / string) → cents per hour */
function nationalPriceToCents(value: unknown): number {
  if (value == null || value === '') return 0;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export const invoicesRepository = {
  async getNextInvoiceNumber(): Promise<string> {
    // Ensure sequence exists (defensive check in case it was dropped)
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`);

    const result = await db.execute(sql`SELECT nextval('invoice_number_seq') as num`);
    const num = result.rows[0].num;
    const year = new Date().getFullYear();
    return `${year}-${String(num).padStart(3, '0')}`;
  },

  async findAll(
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<InvoiceWithClient[]> {
    const conditions = [isNull(invoices.deleted_at)];

    if (status && status !== 'all') {
      // Special handling for "overdue" - it's issued invoices past due date
      if (status === 'overdue') {
        conditions.push(eq(invoices.status, 'issued'));
        conditions.push(sql`${invoices.due_date} < CURRENT_DATE`);
      } else {
        conditions.push(eq(invoices.status, status));
      }
    }

    const offset = (page - 1) * limit;
    const results = await db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        client_id: invoices.client_id,
        invoice_date: invoices.invoice_date,
        due_date: invoices.due_date,
        total: invoices.total,
        status: invoices.status,
        notes: invoices.notes,
        issued_at: invoices.issued_at,
        paid_at: invoices.paid_at,
        emailed_at: invoices.emailed_at,
        resend_email_id: invoices.resend_email_id,
        created_at: invoices.created_at,
        updated_at: invoices.updated_at,
        deleted_at: invoices.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
          ndis_number: clients.ndis_number,
        },
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.client_id, clients.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.created_at))
      .limit(limit)
      .offset(offset);

    return results as InvoiceWithClient[];
  },

  async count(status?: string): Promise<number> {
    const conditions = [isNull(invoices.deleted_at)];

    if (status && status !== 'all') {
      conditions.push(eq(invoices.status, status));
    }

    const result = await db
      .select({ value: count() })
      .from(invoices)
      .where(and(...conditions));

    return result[0]?.value ?? 0;
  },

  async findById(id: string): Promise<InvoiceWithClient | null> {
    const results = await db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        client_id: invoices.client_id,
        invoice_date: invoices.invoice_date,
        due_date: invoices.due_date,
        total: invoices.total,
        status: invoices.status,
        notes: invoices.notes,
        service_period_start: invoices.service_period_start,
        service_period_end: invoices.service_period_end,
        issued_at: invoices.issued_at,
        paid_at: invoices.paid_at,
        emailed_at: invoices.emailed_at,
        resend_email_id: invoices.resend_email_id,
        created_at: invoices.created_at,
        updated_at: invoices.updated_at,
        deleted_at: invoices.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
          ndis_number: clients.ndis_number,
          address: clients.address,
          suburb: clients.suburb,
          email: clients.email,
        },
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.client_id, clients.id))
      .where(and(eq(invoices.id, id), isNull(invoices.deleted_at)))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const invoice = results[0] as InvoiceWithClient;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoice_id, id));

    invoice.items = items;

    return invoice;
  },

  async createWithItems(
    invoiceData: NewInvoice,
    items: NewInvoiceItemInput[],
    sessionIds: string[],
    invoiceRef: string
  ): Promise<Invoice> {
    return await db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(invoiceData).returning();

      if (items.length > 0) {
        await tx.insert(invoiceItems).values(
          items.map(item => ({
            ...item,
            invoice_id: invoice.id,
          })),
        );
      }

      // Mark appointments invoiced — inside the same transaction
      for (const id of sessionIds) {
        if (id.includes('-')) {
          const [appointmentId, clientId] = id.split('-');
          // Mark participant invoiced (within tx)
          await tx.update(appointmentParticipants)
            .set({ invoiced: true, invoice_ref: invoiceRef, updated_at: new Date() })
            .where(and(
              eq(appointmentParticipants.appointment_id, appointmentId),
              eq(appointmentParticipants.client_id, clientId)
            ));
          
          // Check if all participants now invoiced
          const remaining = await tx
            .select({ id: appointmentParticipants.id })
            .from(appointmentParticipants)
            .where(
              and(
                eq(appointmentParticipants.appointment_id, appointmentId),
                eq(appointmentParticipants.invoiced, false)
              )
            )
            .limit(1);

          if (remaining.length === 0) {
            // All participants invoiced — mark appointment
            await tx.update(appointments)
              .set({ invoiced: true, updated_at: new Date() })
              .where(eq(appointments.id, appointmentId));
          }
        } else {
          await tx.update(appointments)
            .set({ invoiced: true, invoice_ref: invoiceRef, updated_at: new Date() })
            .where(eq(appointments.id, id));
        }
      }

      return invoice;
    });
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Invoice ${id} not found`);
    }

    return updated;
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(invoices)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoices.id, id));
  },

  async updateInvoiceItems(
    invoiceId: string,
    items: { id: string; data: Partial<InvoiceItem> }[],
    deletedItemIds: string[],
    newItems: NewInvoiceItemInput[]
  ): Promise<InvoiceItem[]> {
    return await db.transaction(async (tx) => {
      // Update existing items
      for (const { id, data } of items) {
        await tx
          .update(invoiceItems)
          .set(data)
          .where(eq(invoiceItems.id, id));
      }

      // Delete items
      if (deletedItemIds.length > 0) {
        await tx
          .delete(invoiceItems)
          .where(inArray(invoiceItems.id, deletedItemIds));
      }

      // Add new items
      if (newItems.length > 0) {
        const inserted = await tx
          .insert(invoiceItems)
          .values(
            newItems.map(item => ({
              ...item,
              invoice_id: invoiceId,
            }))
          )
          .returning();
        
        return inserted;
      }

      return [];
    });
  },

  async deleteInvoiceItem(id: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
  },

  async getNdisPrice(supportItemCode: string): Promise<number> {
    const result = await db
      .select({ national_price: ndisPricing.national_price })
      .from(ndisPricing)
      .where(eq(ndisPricing.support_item_code, supportItemCode))
      .limit(1);

    if (result.length === 0) {
      return 0;
    }

    return parseFloat(result[0].national_price || '0') * 100;
  },

  /**
   * Unmark appointments as invoiced when an invoice is cancelled or deleted
   * This allows the sessions to appear in the uninvoiced list again
   */
  async unmarkAppointmentsForInvoice(invoiceNumber: string): Promise<void> {
    // Unflag solo appointments
    await db.update(appointments)
      .set({ invoiced: false, invoice_ref: null, updated_at: new Date() })
      .where(eq(appointments.invoice_ref, invoiceNumber));

    // Unflag group appointment participants
    await db.update(appointmentParticipants)
      .set({ invoiced: false, invoice_ref: null, updated_at: new Date() })
      .where(eq(appointmentParticipants.invoice_ref, invoiceNumber));

    // Re-check group appointments — if any participant is now uninvoiced,
    // the parent appointment should also be unflagged
    const appointmentIds = await db
      .select({ id: appointmentParticipants.appointment_id })
      .from(appointmentParticipants)
      .where(eq(appointmentParticipants.invoiced, false))
      .groupBy(appointmentParticipants.appointment_id);

    if (appointmentIds.length > 0) {
      await db.update(appointments)
        .set({ invoiced: false, updated_at: new Date() })
        .where(
          inArray(
            appointments.id,
            appointmentIds.map(a => a.id)
          )
        );
    }
  },

  /**
   * Get uninvoiced completed sessions within date range, grouped by client
   * Handles both solo and group appointments
   * 
   * Note: endDate should be the end of the day (23:59:59.999) to include
   * sessions that end on that date. If passed as a plain date string,
   * it will be adjusted to end of day.
   */
  async getUninvoicedSessionsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ClientSessionGroup[]> {
    // Ensure endDate is end of day to include sessions ending on that date
    // (date inputs often return midnight, which would exclude same-day sessions)
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    // Fetch completed uninvoiced appointments
    const results = await db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        is_group: appointments.is_group,
        group_size: appointments.group_size,
        rate_code: appointments.rate_code,
        travel_km: appointments.travel_km,
        client_name: clients.name,
        weekday_code: clients.weekday_code,
        saturday_code: clients.saturday_code,
        sunday_code: clients.sunday_code,
        // Direct join: group (and solo override) rate_code → national price (avoids JS map / trim mismatches)
        ndisNationalPrice: ndisPricing.national_price,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.client_id, clients.id))
      .leftJoin(
        ndisPricing,
        sql`trim(both from ${ndisPricing.support_item_code}) = trim(both from ${appointments.rate_code})`,
      )
      .where(
        and(
          isNull(appointments.deleted_at),
          eq(appointments.status, 'completed'),
          eq(appointments.invoiced, false),
          gte(appointments.starts_at, startDate),
          lte(appointments.ends_at, endOfDay),
        ),
      )
      .orderBy(appointments.starts_at);

    // Get all appointment IDs for fetching participants
    const appointmentIds = results.map(r => r.id);

    // Fetch UNINVOICED participants for group appointments
    const participantsData = appointmentIds.length > 0 
      ? await db
          .select({
            appointment_id: appointmentParticipants.appointment_id,
            client_id: appointmentParticipants.client_id,
            split_rate: appointmentParticipants.split_rate,
            client_name: clients.name,
            weekday_code: clients.weekday_code,
            saturday_code: clients.saturday_code,
            sunday_code: clients.sunday_code,
          })
          .from(appointmentParticipants)
          .innerJoin(clients, eq(appointmentParticipants.client_id, clients.id))
          .where(
            and(
              inArray(appointmentParticipants.appointment_id, appointmentIds),
              eq(appointmentParticipants.invoiced, false)
            )
          )
      : [];

    // Group participants by appointment_id
    const participantsByAppointment = participantsData.reduce((acc, p) => {
      if (!acc[p.appointment_id]) acc[p.appointment_id] = [];
      acc[p.appointment_id].push(p);
      return acc;
    }, {} as Record<string, typeof participantsData>);

    // Batch fetch all NDIS prices to avoid N+1 queries
    const rawCodes: string[] = [
      // Group: only the NDIS item selected on the appointment (split equally at billing time)
      ...results.filter(r => r.is_group && r.rate_code).map(r => r.rate_code!.trim()),
      // Solo: client day codes + appointment override (e.g. overnight sleepover)
      ...results.filter(r => !r.is_group).flatMap(r => {
        const codes = [r.weekday_code, r.saturday_code, r.sunday_code]
          .filter((c): c is string => Boolean(c))
          .map(c => c.trim());
        if (r.rate_code?.trim()) codes.push(r.rate_code.trim());
        return codes;
      }),
    ];
    const uniqueCodes = [...new Set(rawCodes.filter(Boolean))];

    // Single batch query for all prices
    const priceRows = uniqueCodes.length > 0 
      ? await db
          .select({
            support_item_code: ndisPricing.support_item_code,
            national_price: ndisPricing.national_price,
          })
          .from(ndisPricing)
          .where(inArray(ndisPricing.support_item_code, uniqueCodes))
      : [];

    // Trim keys so lookups match codes stored with accidental whitespace
    const priceMap = new Map<string, number>();
    for (const r of priceRows) {
      const key = (r.support_item_code || '').trim();
      if (key) {
        priceMap.set(key, nationalPriceToCents(r.national_price));
      }
    }

    const clientGroups: Map<string, ClientSessionGroup> = new Map();

    for (const apt of results) {
      const start = new Date(apt.starts_at);
      const end = new Date(apt.ends_at);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const dayOfWeek = start.getDay();

      // Handle group appointments — NDIS item from appointment only; rate split equally by participant count
      if (apt.is_group && participantsByAppointment[apt.id]) {
        const participants = participantsByAppointment[apt.id];
        const displayNdisCode = String(apt.rate_code ?? '').trim();
        // Prefer SQL join price (reliable); fall back to batch map
        const fullHourlyRateCents =
          nationalPriceToCents(apt.ndisNationalPrice) ||
          getPriceCents(priceMap, apt.rate_code);
        const n = participants.length;
        const splitRate =
          n > 0 && fullHourlyRateCents > 0 ? fullHourlyRateCents / n : 0;

        for (const participant of participants) {
          // Composite ID format: "apptId-clientId"
          // This uniquely identifies each participant in a group appointment
          // (e.g., "abc123-def456" where abc123 is the appointment ID and def456 is the client ID)
          // This approach allows treating each group participant as a separate session for invoicing,
          // while maintaining the relationship to the original appointment
          const session: UninvoicedSession = {
            id: `${apt.id}-${participant.client_id}`,
            client_id: participant.client_id,
            client_name: participant.client_name,
            starts_at: start,
            ends_at: end,
            duration_hours: durationHours,
            ndis_code: displayNdisCode,
            rate: splitRate,
            day_of_week: dayOfWeek,
            travel_km: apt.travel_km ? parseFloat(apt.travel_km) : null,
            is_group_share: true,
            group_participant_count: n,
            full_ndis_hourly_rate_cents: fullHourlyRateCents > 0 ? fullHourlyRateCents : undefined,
          };

          if (!clientGroups.has(participant.client_id)) {
            clientGroups.set(participant.client_id, {
              client_id: participant.client_id,
              client_name: participant.client_name,
              is_group: true,
              sessions: [],
              total_sessions: 0,
              total_hours: 0,
              estimated_total: 0,
            });
          }

          const group = clientGroups.get(participant.client_id)!;
          group.is_group = true;
          group.sessions.push(session);
          group.total_sessions++;
          group.total_hours += durationHours;
          // Calculate line item total: hourly rate × duration
          group.estimated_total += splitRate * durationHours;
        }
      } else if (apt.client_id && apt.client_name) {
        // Solo appointment - check for appointment-specific rate override
        let ndisCode: string | null = null;
        
        // Priority 1: Use appointment's rate_code if set (override)
        if (apt.rate_code?.trim()) {
          ndisCode = apt.rate_code.trim();
        } else {
          // Priority 2: Fall back to client's day-specific default codes
          ndisCode = ndisCodeForDayOfWeek(dayOfWeek, {
            weekday_code: apt.weekday_code,
            saturday_code: apt.saturday_code,
            sunday_code: apt.sunday_code,
          });
        }

        const rate =
          nationalPriceToCents(apt.ndisNationalPrice) ||
          getPriceCents(priceMap, ndisCode);

        const session: UninvoicedSession = {
          id: apt.id,
          client_id: apt.client_id,
          client_name: apt.client_name,
          starts_at: start,
          ends_at: end,
          duration_hours: durationHours,
          ndis_code: ndisCode || '',
          rate,
          day_of_week: dayOfWeek,
          travel_km: apt.travel_km ? parseFloat(apt.travel_km) : null,
        };

        if (!clientGroups.has(apt.client_id)) {
          clientGroups.set(apt.client_id, {
            client_id: apt.client_id,
            client_name: apt.client_name,
            is_group: false,
            sessions: [],
            total_sessions: 0,
            total_hours: 0,
            estimated_total: 0,
          });
        }

        const group = clientGroups.get(apt.client_id)!;
        group.sessions.push(session);
        group.total_sessions++;
        group.total_hours += durationHours;
        // Calculate line item total: hourly rate × duration
        group.estimated_total += rate * durationHours;
      }
    }

    return Array.from(clientGroups.values());
  },

  async markAppointmentsInvoiced(sessionIds: string[], invoiceRef: string): Promise<void> {
    for (const id of sessionIds) {
      if (id.includes('-')) {
        // Composite ID format for group sessions: "apptId-clientId"
        // Parse to extract appointment ID and client ID separately
        // This allows marking individual participants as invoiced while tracking
        // which invoice they were billed to via invoice_ref
        const [appointmentId, clientId] = id.split('-');
        await appointmentsRepository.markParticipantInvoiced(
          appointmentId, clientId, invoiceRef
        );
      } else {
        // Solo appointment - mark the appointment directly
        await db
          .update(appointments)
          .set({ invoiced: true, invoice_ref: invoiceRef, updated_at: new Date() })
          .where(eq(appointments.id, id));
      }
    }
  },

  /**
   * Find draft invoices older than specified days
   */
  async findStaleDrafts(daysOld: number): Promise<InvoiceWithClient[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const results = await db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        client_id: invoices.client_id,
        invoice_date: invoices.invoice_date,
        due_date: invoices.due_date,
        total: invoices.total,
        status: invoices.status,
        notes: invoices.notes,
        issued_at: invoices.issued_at,
        paid_at: invoices.paid_at,
        emailed_at: invoices.emailed_at,
        resend_email_id: invoices.resend_email_id,
        created_at: invoices.created_at,
        updated_at: invoices.updated_at,
        deleted_at: invoices.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
          ndis_number: clients.ndis_number,
        },
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.client_id, clients.id))
      .where(
        and(
          eq(invoices.status, 'draft'),
          isNull(invoices.deleted_at),
          lt(invoices.created_at, cutoffDate)
        )
      )
      .orderBy(desc(invoices.created_at));

    return results as InvoiceWithClient[];
  },

  /**
   * Get summary statistics for the invoice list page
   * Returns counts and totals for outstanding, overdue, paid (this month), and draft invoices
   */
  async getSummaryStats(): Promise<{
    outstanding: { count: number; total: number };
    overdue: { count: number; total: number };
    paid_this_month: { count: number; total: number };
    draft: { count: number; total: number };
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'issued' AND due_date >= ${now}) as outstanding_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'issued' AND due_date >= ${now}), 0) as outstanding_total,
        COUNT(*) FILTER (WHERE status = 'issued' AND due_date < ${now}) as overdue_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'issued' AND due_date < ${now}), 0) as overdue_total,
        COUNT(*) FILTER (WHERE status = 'paid' AND paid_at >= ${monthStart}) as paid_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'paid' AND paid_at >= ${monthStart}), 0) as paid_total,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'draft'), 0) as draft_total
      FROM invoices
      WHERE deleted_at IS NULL
    `);

    const row = result.rows[0] as any;
    return {
      outstanding: {
        count: parseInt(String(row.outstanding_count)) || 0,
        total: Math.round(parseFloat(String(row.outstanding_total)) * 100) || 0,
      },
      overdue: {
        count: parseInt(String(row.overdue_count)) || 0,
        total: Math.round(parseFloat(String(row.overdue_total)) * 100) || 0,
      },
      paid_this_month: {
        count: parseInt(String(row.paid_count)) || 0,
        total: Math.round(parseFloat(String(row.paid_total)) * 100) || 0,
      },
      draft: {
        count: parseInt(String(row.draft_count)) || 0,
        total: Math.round(parseFloat(String(row.draft_total)) * 100) || 0,
      },
    };
  },

  /**
   * Get all uninvoiced completed sessions without date range constraints
   * Used by processBilling() for one-click billing feature
   * Uses a wide date range to effectively return "all" uninvoiced sessions
   */
  async getAllUninvoicedSessions(): Promise<ClientSessionGroup[]> {
    // Use a very wide date range to get all uninvoiced sessions
    const startDate = new Date('1970-01-01');
    const endDate = new Date('2099-12-31');
    return this.getUninvoicedSessionsByDateRange(startDate, endDate);
  },
};
