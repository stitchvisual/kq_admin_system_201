import { invoicesRepository, type ClientSessionGroup, type InvoiceWithClient, type NewInvoiceItemInput, type UninvoicedSession } from '@/repositories/invoices.repository';
import { ndisPricing, invoiceItems, appointments } from '@/db/schema';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { addDays, format as formatDateForInput } from 'date-fns';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';

// Travel rate per km in dollars (from env or default to NDIS rate)
const TRAVEL_RATE_PER_KM = parseFloat(process.env.NEXT_PUBLIC_TRAVEL_RATE || '0.97');

function formatAud(amountDollars: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amountDollars);
}

/** Invoice / PDF line text for support rows — spells out group equal split when applicable */
function buildSupportLineDescription(session: UninvoicedSession): string {
  const datePart = `${formatDate(session.starts_at)} (${session.duration_hours.toFixed(1)} hrs)`;
  if (session.is_group_share && session.group_participant_count && session.group_participant_count > 1) {
    const bits: string[] = [
      `Support — ${datePart}`,
      `Group session (${session.group_participant_count} participants, equal split)`,
    ];
    if (session.ndis_code?.trim()) {
      bits.push(`NDIS item ${session.ndis_code.trim()}`);
    }
    const shareHr = session.rate / 100;
    if (session.full_ndis_hourly_rate_cents && session.full_ndis_hourly_rate_cents > 0) {
      const fullHr = session.full_ndis_hourly_rate_cents / 100;
      bits.push(`${formatAud(fullHr)}/hr full rate → ${formatAud(shareHr)}/hr your share`);
    } else {
      bits.push(`${formatAud(shareHr)}/hr your share`);
    }
    return bits.join(' · ');
  }
  return `Support — ${datePart}`;
}

export type GenerateInvoiceInput = {
  client_id: string;
  sessions: UninvoicedSession[];
  due_date: string;
  notes?: string;
};

export type GenerateAllInput = {
  clients: { client_id: string; sessions: UninvoicedSession[] }[];
  due_date: string;
  notes?: string;
};

export type UpdateInvoiceInput = {
  due_date?: string;
  notes?: string;
  service_period_start?: string;
  service_period_end?: string;
  items?: {
    updated?: Array<{
      id: string;
      description?: string;
      quantity?: string;
      unit_price?: string;
      ndis_item_code?: string | null;
      support_category?: string | null;
      travel_km?: number | null;  // Travel distance for appointment-linked items
    }>;
    deleted?: string[];
    new?: Array<{
      description: string;
      quantity: string;
      unit_price: string;
      ndis_item_code?: string | null;
      support_category?: string | null;
    }>;
  };
};

export const invoicesService = {
  async list(status?: string, page: number = 1, limit: number = 10): Promise<InvoiceWithClient[]> {
    return invoicesRepository.findAll(status, page, limit);
  },

  async count(status?: string): Promise<number> {
    return invoicesRepository.count(status);
  },

  async getById(id: string): Promise<InvoiceWithClient> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }
    return invoice;
  },

  async getUninvoicedSessions(startDate: string, endDate: string): Promise<ClientSessionGroup[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return invoicesRepository.getUninvoicedSessionsByDateRange(start, end);
  },

  async generateInvoice(input: GenerateInvoiceInput): Promise<InvoiceWithClient> {
    const sessions = input.sessions;

    if (sessions.length === 0) {
      throw new ValidationError('No sessions selected for invoicing');
    }

    // Validate that all sessions have valid rates (prevent $0 invoices from unknown rate codes)
    const sessionsWithZeroRate = sessions.filter(s => s.rate === 0);
    if (sessionsWithZeroRate.length > 0) {
      const codes = sessionsWithZeroRate.map(s => s.ndis_code || 'unknown').join(', ');
      throw new ValidationError(
        `Cannot generate invoice: ${sessionsWithZeroRate.length} session(s) have no NDIS rate. ` +
        `Check that client has rate codes assigned, or that the rate code exists in the pricing table. ` +
        `Affected codes: ${codes}`
      );
    }

    const invoiceNumber = await invoicesRepository.getNextInvoiceNumber();

    // Sort sessions chronologically before creating invoice items
    // Note: sessions from API have date strings, convert to Date for comparison
    const sortedSessions = [...sessions].sort((a, b) => {
      const aTime = a.starts_at instanceof Date ? a.starts_at : new Date(a.starts_at);
      const bTime = b.starts_at instanceof Date ? b.starts_at : new Date(b.starts_at);
      return aTime.getTime() - bTime.getTime();
    });

    // Calculate service period (earliest start to latest end)
    const servicePeriodStart = new Date(sortedSessions[0].starts_at);
    const servicePeriodEnd = new Date(sortedSessions[sortedSessions.length - 1].ends_at);

    let totalCents = 0;
    sortedSessions.forEach((s) => {
      // Calculate line item total: hourly rate × duration_hours
      totalCents += s.rate * s.duration_hours;
    });

    // Calculate total travel km for this client
    const totalTravelKm = sortedSessions.reduce((sum, s) => {
      return sum + (s.travel_km || 0);
    }, 0);
    
    // Add travel line item if there's travel distance
    const travelCents = totalTravelKm > 0 ? Math.round(totalTravelKm * TRAVEL_RATE_PER_KM * 100) : 0;
    totalCents += travelCents;

    // Batch fetch NDIS pricing categories
    const uniqueCodes = [
      ...new Set(
        sortedSessions
          .map(s => s.ndis_code?.trim())
          .filter((c): c is string => Boolean(c)),
      ),
    ];
    const categoryMap = new Map<string, string | null>();
    
    if (uniqueCodes.length > 0) {
      const pricingData = await db
        .select({
          support_item_code: ndisPricing.support_item_code,
          category: ndisPricing.category,
        })
        .from(ndisPricing)
        .where(inArray(ndisPricing.support_item_code, uniqueCodes));
      
      pricingData.forEach(p => {
        const k = p.support_item_code?.trim();
        if (k) categoryMap.set(k, p.category);
      });
    }

    const items: NewInvoiceItemInput[] = sortedSessions.map((session) => {
      const code = session.ndis_code?.trim() || '';
      return {
        // Extract real appointment ID from composite IDs (e.g., "appt123-client456" → "appt123")
        appointment_id: session.id.includes('-') ? session.id.split('-')[0] : session.id,
        description: buildSupportLineDescription(session),
        quantity: session.duration_hours.toFixed(2),
        unit_price: (session.rate / 100).toFixed(2),
        ndis_item_code: code || null,
        support_category: code ? (categoryMap.get(code) ?? null) : null,
      };
    });

    // Add travel line item if applicable
    if (totalTravelKm > 0) {
      items.push({
        appointment_id: null,
        description: `Provider Travel - ${totalTravelKm.toFixed(1)} km`,
        quantity: totalTravelKm.toFixed(1),
        unit_price: TRAVEL_RATE_PER_KM.toFixed(2),
        ndis_item_code: null,
        support_category: 'Travel',
      });
    }

    const invoice = await invoicesRepository.createWithItems(
      {
        invoice_number: invoiceNumber,
        client_id: input.client_id,
        invoice_date: new Date(),
        due_date: new Date(input.due_date),
        total: (totalCents / 100).toFixed(2),
        status: 'draft',
        notes: input.notes || null,
        service_period_start: servicePeriodStart,
        service_period_end: servicePeriodEnd,
      },
      items,
      sessions.map(s => s.id),
      invoiceNumber
    );

    // Save travel_km values to appointments
    for (const session of sortedSessions) {
      if (session.travel_km !== null && session.travel_km !== undefined) {
        const appointmentId = session.id.includes('-') ? session.id.split('-')[0] : session.id;
        // Safely convert travel_km to string with 2 decimal places
        // Handles both number (from DB) and string (from API) types
        const travelKmValue = typeof session.travel_km === 'number'
          ? session.travel_km.toFixed(2)
          : String(parseFloat(String(session.travel_km)).toFixed(2));
        
        await db
          .update(appointments)
          .set({ travel_km: travelKmValue, updated_at: new Date() })
          .where(eq(appointments.id, appointmentId));
      }
    }

    const created = await invoicesRepository.findById(invoice.id);
    if (!created) {
      throw new NotFoundError('Invoice', invoice.id);
    }
    return created;
  },

  async generateAllInvoices(input: GenerateAllInput): Promise<InvoiceWithClient[]> {
    const results: InvoiceWithClient[] = [];

    for (const client of input.clients) {
      const invoice = await this.generateInvoice({
        client_id: client.client_id,
        sessions: client.sessions,
        due_date: input.due_date,
        notes: input.notes,
      });
      results.push(invoice);
    }

    return results;
  },

  async issueInvoice(id: string): Promise<InvoiceWithClient> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    if (invoice.status !== 'draft') {
      throw new ValidationError('Only draft invoices can be issued');
    }

    await invoicesRepository.update(id, {
      status: 'issued',
      issued_at: new Date(),
    });

    const updated = await invoicesRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Invoice', id);
    }
    return updated;
  },

  async markPaid(id: string): Promise<InvoiceWithClient> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    if (invoice.status !== 'issued') {
      throw new ValidationError('Only issued invoices can be marked as paid');
    }

    await invoicesRepository.update(id, {
      status: 'paid',
      paid_at: new Date(),
    });

    const updated = await invoicesRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Invoice', id);
    }
    return updated;
  },

  async cancelInvoice(id: string): Promise<InvoiceWithClient> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    if (invoice.status === 'paid') {
      throw new ValidationError('Cannot cancel a paid invoice');
    }

    await invoicesRepository.update(id, {
      status: 'cancelled',
    });

    // Unflag appointments so they reappear in uninvoiced list
    await invoicesRepository.unmarkAppointmentsForInvoice(invoice.invoice_number);

    const updated = await invoicesRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Invoice', id);
    }
    return updated;
  },

  async updateInvoice(id: string, data: UpdateInvoiceInput): Promise<InvoiceWithClient> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    // Only draft invoices can be edited
    if (invoice.status !== 'draft') {
      throw new ValidationError('Only draft invoices can be edited');
    }

    // Update invoice header fields
    const updateData: any = {};
    if (data.due_date !== undefined) {
      updateData.due_date = new Date(data.due_date);
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes || null;
    }
    if (data.service_period_start !== undefined) {
      updateData.service_period_start = data.service_period_start ? new Date(data.service_period_start) : null;
    }
    if (data.service_period_end !== undefined) {
      updateData.service_period_end = data.service_period_end ? new Date(data.service_period_end) : null;
    }

    // Handle item updates
    if (data.items) {
      const { updated = [], deleted = [], new: newItems = [] } = data.items;
      
      // Collect travel_km updates for appointments (before updating items)
      // We need to do this before the update so we can match items to appointments
      const itemsBeforeUpdate = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoice_id, id));

      const itemMapBefore = new Map(itemsBeforeUpdate.map(item => [item.id, item]));

      // Prepare update data for existing items
      const updatedItems = updated.map(item => ({
        id: item.id,
        data: {
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          ndis_item_code: item.ndis_item_code,
          support_category: item.support_category,
        }
      }));

      // Prepare new items
      const newItemInputs: NewInvoiceItemInput[] = newItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        ndis_item_code: item.ndis_item_code,
        support_category: item.support_category,
      }));

      // Update items in database
      await invoicesRepository.updateInvoiceItems(id, updatedItems, deleted, newItemInputs);

      // Handle travel_km updates for appointment-linked items
      // We need to recalculate travel if: travel_km changed OR appointment-linked items were deleted
      let needsTravelRecalc = false;

      for (const update of updated) {
        if (update.travel_km !== undefined) {
          const itemBefore = itemMapBefore.get(update.id);
          if (itemBefore?.appointment_id) {
            // Update the appointment's travel_km
            const travelKmValue = typeof update.travel_km === 'number'
              ? update.travel_km.toFixed(2)
              : String(update.travel_km || 0);
            
            await db
              .update(appointments)
              .set({ travel_km: travelKmValue, updated_at: new Date() })
              .where(eq(appointments.id, itemBefore.appointment_id));
            
            needsTravelRecalc = true;
          }
        }
      }

      // Check if any appointment-linked items were deleted
      if (deleted.some(id => {
        const item = itemMapBefore.get(id);
        return item?.appointment_id;
      })) {
        needsTravelRecalc = true;
      }

      // If travel_km changed or items were deleted, recalculate and update the travel line item
      if (needsTravelRecalc) {
        // Get all appointments linked to non-deleted items
        const activeAppointmentIds = itemsBeforeUpdate
          .filter(item => item.appointment_id && !deleted.includes(item.id))
          .map(item => item.appointment_id!);
        
        // Fetch current travel_km values from appointments (after our updates above)
        const travelData = activeAppointmentIds.length > 0 ? await db
          .select({ id: appointments.id, travel_km: appointments.travel_km })
          .from(appointments)
          .where(inArray(appointments.id, activeAppointmentIds)) : [];
        
        const travelMap = new Map(travelData.map(t => [t.id, parseFloat(t.travel_km || '0')]));
        
        // Calculate total travel km from all active appointment-linked items
        const totalTravelKm = itemsBeforeUpdate
          .filter(item => item.appointment_id && !deleted.includes(item.id))
          .reduce((sum, item) => {
            const apptTravel = travelMap.get(item.appointment_id!) || 0;
            return sum + apptTravel;
          }, 0);
        
        // Find the existing travel line item (appointment_id is null for travel items)
        const allInvoiceItems = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoice_id, id));
        
        const existingTravelItem = allInvoiceItems.find(
          item => item.appointment_id === null && item.description?.includes('Provider Travel')
        );
        
        if (existingTravelItem && totalTravelKm > 0) {
          // Update existing travel line item
          await db
            .update(invoiceItems)
            .set({
              quantity: totalTravelKm.toFixed(1),
              unit_price: TRAVEL_RATE_PER_KM.toFixed(2),
              description: `Provider Travel - ${totalTravelKm.toFixed(1)} km`,
            })
            .where(eq(invoiceItems.id, existingTravelItem.id));
        } else if (existingTravelItem && totalTravelKm === 0) {
          // Remove travel line item if no travel
          await db.delete(invoiceItems).where(eq(invoiceItems.id, existingTravelItem.id));
        } else if (!existingTravelItem && totalTravelKm > 0) {
          // Create new travel line item if it doesn't exist
          await db.insert(invoiceItems).values({
            id: crypto.randomUUID(),
            invoice_id: id,
            appointment_id: null,
            description: `Provider Travel - ${totalTravelKm.toFixed(1)} km`,
            quantity: totalTravelKm.toFixed(1),
            unit_price: TRAVEL_RATE_PER_KM.toFixed(2),
            ndis_item_code: null,
            support_category: 'Travel',
            created_at: new Date(),
          });
        }
      }

      // Recalculate total
      const allItems = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoice_id, id));

      const totalCents = allItems.reduce((sum, item) => {
        return sum + parseFloat(item.quantity) * parseFloat(item.unit_price);
      }, 0);

      updateData.total = (totalCents / 100).toFixed(2);
    }

    // Update invoice
    if (Object.keys(updateData).length > 0) {
      await invoicesRepository.update(id, updateData);
    }

    // Return updated invoice with fresh data
    const updated = await invoicesRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Invoice', id);
    }

    return updated;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const invoice = await invoicesRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    if (invoice.status !== 'draft') {
      throw new ValidationError('Only draft invoices can be deleted');
    }

    await invoicesRepository.softDelete(id);

    // Unflag appointments so they reappear in uninvoiced list
    await invoicesRepository.unmarkAppointmentsForInvoice(invoice.invoice_number);

    return { success: true };
  },

  async getSummaryStats(): Promise<{
    outstanding: { count: number; total: number };
    overdue: { count: number; total: number };
    paid_this_month: { count: number; total: number };
    draft: { count: number; total: number };
  }> {
    return invoicesRepository.getSummaryStats();
  },

  async stampEmailed(id: string, resendEmailId: string | null): Promise<void> {
    await invoicesRepository.update(id, {
      emailed_at: new Date(),
      resend_email_id: resendEmailId,
    });
  },

  async processBilling(
    clientId: string,
    options?: { dueDate?: string; notes?: string; autoEmail?: boolean; appointmentIds?: string[] }
  ): Promise<InvoiceWithClient> {
    const { dueDate, notes, autoEmail, appointmentIds } = options || {};

    // Fetch all uninvoiced completed sessions for this client
    const allUninvoiced = await invoicesRepository.getAllUninvoicedSessions();

    // Filter to this client
    let sessions = allUninvoiced.filter(g => g.client_id === clientId).flatMap(g => g.sessions);

    // If appointment_ids provided, filter to only those sessions (for Quick Bill single session)
    if (appointmentIds && appointmentIds.length > 0) {
      sessions = sessions.filter(s => appointmentIds.includes(s.id));
    }

    if (sessions.length === 0) {
      throw new ValidationError('No uninvoiced sessions found for this client');
    }

    // Generate invoice
    const invoice = await this.generateInvoice({
      client_id: clientId,
      sessions,
      due_date: dueDate || formatDateForInput(addDays(new Date(), 14)),
      notes,
    });

    // Auto-issue if requested
    if (autoEmail || true) {  // Always auto-issue for "sleek" experience
      await this.issueInvoice(invoice.id);
      invoice.status = 'issued';
      invoice.issued_at = new Date();
    }

    // Send email if requested
    if (autoEmail) {
      try {
        const buffer = await generateInvoicePdfBuffer(invoice);
        const { resend } = await import('@/lib/resend');
        const { isResendConfigured, getFromAddress } = await import('@/lib/resend');
        const { buildInvoiceEmailHtml } = await import('@/emails/invoice-email');

        if (isResendConfigured() && resend.resend) {
          const html = buildInvoiceEmailHtml({
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoice_number,
            total: formatAud(parseFloat(String(invoice.total))),
            dueDate: formatDate(invoice.due_date),
          });

          await resend.resend.emails.send({
            from: getFromAddress(),
            to: [invoice.client.email],
            subject: `Invoice ${invoice.invoice_number} from ${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'KQ Collective'}`,
            html,
            attachments: [{ filename: `${invoice.invoice_number}.pdf`, content: buffer }],
          });

          await this.stampEmailed(invoice.id, null);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the whole billing if email fails
      }
    }

    // Return fresh invoice data
    return this.getById(invoice.id);
  },
};