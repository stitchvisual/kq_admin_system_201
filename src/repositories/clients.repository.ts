import { db } from '@/db';
import { clients, type Client, type NewClient } from '@/db/schema/clients';
import { appointments } from '@/db/schema/appointments';
import { invoices } from '@/db/schema/invoices';
import { ndisPricing } from '@/db/schema/ndis_pricing';
import { eq, isNull, ilike, and, desc, count, sql } from 'drizzle-orm';

export const clientsRepository = {
  async findAll(search?: string, page: number = 1, limit: number = 10): Promise<Client[]> {
    const conditions = [isNull(clients.deleted_at)];

    if (search) {
      conditions.push(ilike(clients.name, `%${search}%`));
    }

    const offset = (page - 1) * limit;
    return db
      .select()
      .from(clients)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
  },

  async count(search?: string): Promise<number> {
    const conditions = [isNull(clients.deleted_at)];

    if (search) {
      conditions.push(ilike(clients.name, `%${search}%`));
    }

    const results = await db
      .select()
      .from(clients)
      .where(and(...conditions));
    
    return results.length;
  },

  async findById(id: string): Promise<Client | null> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), isNull(clients.deleted_at)));

    return client ?? null;
  },

  async findByEmail(email: string): Promise<Client | null> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.email, email), isNull(clients.deleted_at)));

    return client ?? null;
  },

  async create(data: NewClient): Promise<Client> {
    const [client] = await db.insert(clients).values(data).returning();
    return client;
  },

  async update(id: string, data: Partial<NewClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...data, updated_at: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(clients)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(clients.id, id));
  },

  async getClientDetail(clientId: string) {
    // 1. Get client
    const client = await this.findById(clientId);
    if (!client) return null;

    // 2. Get rate code details from NDIS pricing
    const rateCodes = {
      weekday: null as { code: string; name: string; price: string } | null,
      saturday: null as { code: string; name: string; price: string } | null,
      sunday: null as { code: string; name: string; price: string } | null,
    };

    if (client.weekday_code) {
      const [weekdayRate] = await db
        .select()
        .from(ndisPricing)
        .where(eq(ndisPricing.support_item_code, client.weekday_code))
        .limit(1);
      if (weekdayRate && weekdayRate.support_item_name && weekdayRate.national_price) {
        rateCodes.weekday = {
          code: weekdayRate.support_item_code,
          name: weekdayRate.support_item_name,
          price: weekdayRate.national_price,
        };
      }
    }

    if (client.saturday_code) {
      const [saturdayRate] = await db
        .select()
        .from(ndisPricing)
        .where(eq(ndisPricing.support_item_code, client.saturday_code))
        .limit(1);
      if (saturdayRate && saturdayRate.support_item_name && saturdayRate.national_price) {
        rateCodes.saturday = {
          code: saturdayRate.support_item_code,
          name: saturdayRate.support_item_name,
          price: saturdayRate.national_price,
        };
      }
    }

    if (client.sunday_code) {
      const [sundayRate] = await db
        .select()
        .from(ndisPricing)
        .where(eq(ndisPricing.support_item_code, client.sunday_code))
        .limit(1);
      if (sundayRate && sundayRate.support_item_name && sundayRate.national_price) {
        rateCodes.sunday = {
          code: sundayRate.support_item_code,
          name: sundayRate.support_item_name,
          price: sundayRate.national_price,
        };
      }
    }

    // 3. Get recent appointments (last 10)
    const recentAppointments = await db
      .select({
        id: appointments.id,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        status: appointments.status,
        invoiced: appointments.invoiced,
        is_group: appointments.is_group,
      })
      .from(appointments)
      .where(and(eq(appointments.client_id, clientId), isNull(appointments.deleted_at)))
      .orderBy(desc(appointments.starts_at))
      .limit(10);

    // 4. Get client invoices (last 5)
    const clientInvoices = await db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        total: invoices.total,
        status: invoices.status,
        invoice_date: invoices.invoice_date,
        due_date: invoices.due_date,
      })
      .from(invoices)
      .where(and(eq(invoices.client_id, clientId), isNull(invoices.deleted_at)))
      .orderBy(desc(invoices.created_at))
      .limit(5);

    // 5. Calculate outstanding balance (sum of issued invoices)
    const outstandingResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(total::numeric), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.client_id, clientId),
          eq(invoices.status, 'issued'),
          isNull(invoices.deleted_at)
        )
      );

    const outstandingBalance = Math.round(parseFloat(outstandingResult[0]?.total || '0') * 100);

    // 6. Get stats
    const appointmentCountResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(eq(appointments.client_id, clientId), isNull(appointments.deleted_at)));

    const invoiceStatsResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'issued') as invoiced_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'issued'), 0) as invoiced_total,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COALESCE(SUM(total::numeric) FILTER (WHERE status = 'paid'), 0) as paid_total
      FROM invoices
      WHERE client_id = ${clientId} AND deleted_at IS NULL
    `);

    const invoiceStats = invoiceStatsResult.rows[0] as any;

    return {
      client,
      rate_codes: rateCodes,
      recent_appointments: recentAppointments,
      invoices: clientInvoices,
      outstanding_balance: outstandingBalance,
      stats: {
        total_sessions: appointmentCountResult[0]?.count || 0,
        total_invoiced: Math.round(parseFloat(String(invoiceStats?.invoiced_total || 0)) * 100),
        total_paid: Math.round(parseFloat(String(invoiceStats?.paid_total || 0)) * 100),
      },
    };
  },

  async getRelatedCounts(clientId: string) {
    const appointmentCountResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(eq(appointments.client_id, clientId), isNull(appointments.deleted_at)));

    const invoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(eq(invoices.client_id, clientId), isNull(invoices.deleted_at)));

    const unpaidInvoicesResult = await db
      .select({
        count: count(),
        total: sql<string>`COALESCE(SUM(total::numeric), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.client_id, clientId),
          eq(invoices.status, 'issued'),
          isNull(invoices.deleted_at)
        )
      );

    return {
      appointments: appointmentCountResult[0]?.count || 0,
      invoices: invoiceCountResult[0]?.count || 0,
      unpaid_invoices: unpaidInvoicesResult[0]?.count || 0,
      unpaid_total: Math.round(parseFloat(unpaidInvoicesResult[0]?.total || '0') * 100),
    };
  },
};
