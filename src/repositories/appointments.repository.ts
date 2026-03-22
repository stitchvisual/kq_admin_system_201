import { db } from '@/db';
import { 
  appointments, 
  clients, 
  appointmentParticipants,
  type Appointment, 
  type NewAppointment,
  type NewAppointmentParticipant
} from '@/db/schema';
import { eq, and, gte, lt, lte, isNull, ne, gt, count, inArray } from 'drizzle-orm';

export type Participant = {
  id: string;
  client_id: string;
  name: string;
  split_rate: string;
};

export type AppointmentWithClient = Appointment & {
  client: { id: string; name: string } | null;
  participants?: Participant[];
};

function getDayStart(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDayEnd(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function getWeekEnd(weekStart: Date): Date {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 7);
  return result;
}

export const appointmentsRepository = {
  /**
   * Find all appointments for a given week, with client data and participants
   */
  async findByWeek(weekStart: Date): Promise<AppointmentWithClient[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const results = await db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        title: appointments.title,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        status: appointments.status,
        notes: appointments.notes,
        invoiced: appointments.invoiced,
        invoice_ref: appointments.invoice_ref,
        is_group: appointments.is_group,
        group_size: appointments.group_size,
        rate_code: appointments.rate_code,
        created_at: appointments.created_at,
        updated_at: appointments.updated_at,
        deleted_at: appointments.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.client_id, clients.id))
      .where(
        and(
          gte(appointments.starts_at, weekStart),
          lt(appointments.starts_at, weekEnd),
          isNull(appointments.deleted_at)
        )
      )
      .orderBy(appointments.starts_at);

    // Get all appointment IDs
    const appointmentIds = results.map(r => r.id);
    
    // Fetch participants for group appointments
    const participants = appointmentIds.length > 0 
      ? await db
          .select({
            id: appointmentParticipants.id,
            appointment_id: appointmentParticipants.appointment_id,
            client_id: appointmentParticipants.client_id,
            split_rate: appointmentParticipants.split_rate,
            client_name: clients.name,
          })
          .from(appointmentParticipants)
          .leftJoin(clients, eq(appointmentParticipants.client_id, clients.id))
          .where(inArray(appointmentParticipants.appointment_id, appointmentIds))
      : [];

    // Group participants by appointment_id
    const participantsByAppointment = participants.reduce((acc, p) => {
      if (!acc[p.appointment_id]) acc[p.appointment_id] = [];
      acc[p.appointment_id].push({
        id: p.id,
        client_id: p.client_id,
        name: p.client_name || 'Unknown',
        split_rate: p.split_rate,
      });
      return acc;
    }, {} as Record<string, Participant[]>);

    // Merge results
    return results.map(r => ({
      ...r,
      client: r.client_id && r.client?.id ? { id: r.client.id, name: r.client.name } : null,
      participants: participantsByAppointment[r.id] || [],
    })) as AppointmentWithClient[];
  },

  /**
   * Find a single appointment by ID with client data and participants
   */
  async findById(id: string): Promise<AppointmentWithClient | null> {
    const results = await db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        title: appointments.title,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        status: appointments.status,
        notes: appointments.notes,
        invoiced: appointments.invoiced,
        invoice_ref: appointments.invoice_ref,
        is_group: appointments.is_group,
        group_size: appointments.group_size,
        rate_code: appointments.rate_code,
        created_at: appointments.created_at,
        updated_at: appointments.updated_at,
        deleted_at: appointments.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.client_id, clients.id))
      .where(and(eq(appointments.id, id), isNull(appointments.deleted_at)))
      .limit(1);

    if (!results[0]) return null;

    // Fetch participants for this appointment
    const participants = await db
      .select({
        id: appointmentParticipants.id,
        appointment_id: appointmentParticipants.appointment_id,
        client_id: appointmentParticipants.client_id,
        split_rate: appointmentParticipants.split_rate,
        client_name: clients.name,
      })
      .from(appointmentParticipants)
      .leftJoin(clients, eq(appointmentParticipants.client_id, clients.id))
      .where(eq(appointmentParticipants.appointment_id, id));

    const r = results[0];
    return {
      ...r,
      client: r.client_id && r.client?.id ? { id: r.client.id, name: r.client.name } : null,
      participants: participants.map(p => ({
        id: p.id,
        client_id: p.client_id,
        name: p.client_name || 'Unknown',
        split_rate: p.split_rate,
      })),
    } as AppointmentWithClient;
  },

  /**
   * Create a new appointment
   */
  async create(data: NewAppointment): Promise<Appointment> {
    const results = await db.insert(appointments).values(data).returning();
    return results[0];
  },

  /**
   * Create participants for a group appointment
   */
  async createParticipants(participants: NewAppointmentParticipant[]): Promise<void> {
    if (participants.length > 0) {
      await db.insert(appointmentParticipants).values(participants);
    }
  },

  /**
   * Get participants for an appointment
   */
  async getParticipants(appointmentId: string): Promise<Participant[]> {
    const results = await db
      .select({
        id: appointmentParticipants.id,
        client_id: appointmentParticipants.client_id,
        split_rate: appointmentParticipants.split_rate,
        client_name: clients.name,
      })
      .from(appointmentParticipants)
      .leftJoin(clients, eq(appointmentParticipants.client_id, clients.id))
      .where(eq(appointmentParticipants.appointment_id, appointmentId));

    return results.map(r => ({
      id: r.id,
      client_id: r.client_id,
      name: r.client_name || 'Unknown',
      split_rate: r.split_rate,
    }));
  },

  /**
   * Delete participants for an appointment
   */
  async deleteParticipants(appointmentId: string): Promise<void> {
    await db
      .delete(appointmentParticipants)
      .where(eq(appointmentParticipants.appointment_id, appointmentId));
  },

  /**
   * Update an existing appointment
   */
  async update(id: string, data: Partial<NewAppointment>): Promise<Appointment> {
    const results = await db
      .update(appointments)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();
    return results[0];
  },

  /**
   * Soft delete an appointment
   */
  async softDelete(id: string): Promise<void> {
    await db
      .update(appointments)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(appointments.id, id));
  },

  /**
   * Check if a new appointment would overlap with ANY existing appointment in system.
   * 
   * This performs a GLOBAL overlap check (not client-specific) because KQ is a solo provider
   * and can only be in one place at a time. All appointments must be checked regardless of which
   * client they're for.
   * 
   * Overlap Logic: Two appointments overlap if:
   *   - newStart < existingEnd AND newEnd > existingStart
   *   - This catches partial overlaps, nested appointments, and back-to-back scenarios
   * 
   * @param startsAt - The start time of the proposed appointment
   * @param endsAt - The end time of the proposed appointment
   * @param excludeId - Optional: ID of appointment to exclude (useful when updating existing appointments)
   * @returns Promise<boolean> - true if overlap detected, false if time slot is available
   * 
   * @example
   * ```ts
   * // Check for new appointment
   * const hasOverlap = await checkOverlap(new Date('2024-01-15T09:00'), new Date('2024-01-15T10:00'));
   * 
   * // Check when updating (exclude current appointment from overlap check)
   * const hasOverlap = await checkOverlap(newStart, newEnd, appointmentId);
   * ```
   */
  async checkOverlap(
    startsAt: Date,
    endsAt: Date,
    excludeId?: string
  ): Promise<boolean> {
    const conditions = [
      isNull(appointments.deleted_at),
      ne(appointments.status, 'cancelled'),
      lt(appointments.starts_at, endsAt),
      gt(appointments.ends_at, startsAt),
    ];

    if (excludeId) {
      conditions.push(ne(appointments.id, excludeId));
    }

    const results = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(...conditions))
      .limit(1);

    return results.length > 0;
  },

  async findTodaysAppointments(): Promise<AppointmentWithClient[]> {
    const today = new Date();
    const dayStart = getDayStart(today);
    const dayEnd = getDayEnd(today);

    const results = await db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        title: appointments.title,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        status: appointments.status,
        notes: appointments.notes,
        invoiced: appointments.invoiced,
        invoice_ref: appointments.invoice_ref,
        is_group: appointments.is_group,
        group_size: appointments.group_size,
        rate_code: appointments.rate_code,
        created_at: appointments.created_at,
        updated_at: appointments.updated_at,
        deleted_at: appointments.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.client_id, clients.id))
      .where(
        and(
          isNull(appointments.deleted_at),
          gte(appointments.starts_at, dayStart),
          lte(appointments.starts_at, dayEnd)
        )
      )
      .orderBy(appointments.starts_at);

    // Get participants for group appointments
    const appointmentIds = results.map(r => r.id);
    const participants = appointmentIds.length > 0 
      ? await db
          .select({
            id: appointmentParticipants.id,
            appointment_id: appointmentParticipants.appointment_id,
            client_id: appointmentParticipants.client_id,
            split_rate: appointmentParticipants.split_rate,
            client_name: clients.name,
          })
          .from(appointmentParticipants)
          .leftJoin(clients, eq(appointmentParticipants.client_id, clients.id))
          .where(inArray(appointmentParticipants.appointment_id, appointmentIds))
      : [];

    const participantsByAppointment = participants.reduce((acc, p) => {
      if (!acc[p.appointment_id]) acc[p.appointment_id] = [];
      acc[p.appointment_id].push({
        id: p.id,
        client_id: p.client_id,
        name: p.client_name || 'Unknown',
        split_rate: p.split_rate,
      });
      return acc;
    }, {} as Record<string, Participant[]>);

    return results.map(r => ({
      ...r,
      client: r.client_id && r.client?.id ? { id: r.client.id, name: r.client.name } : null,
      participants: participantsByAppointment[r.id] || [],
    })) as AppointmentWithClient[];
  },

  async getWeekStats(weekStart: Date): Promise<{ booked: number; completed: number }> {
    const weekEnd = getWeekEnd(weekStart);

    const bookedResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          isNull(appointments.deleted_at),
          gte(appointments.starts_at, weekStart),
          lte(appointments.ends_at, weekEnd)
        )
      );

    const completedResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          isNull(appointments.deleted_at),
          eq(appointments.status, 'completed'),
          gte(appointments.starts_at, weekStart),
          lte(appointments.ends_at, weekEnd)
        )
      );

    return {
      booked: bookedResult[0]?.count ?? 0,
      completed: completedResult[0]?.count ?? 0,
    };
  },

  async findUninvoiced(): Promise<AppointmentWithClient[]> {
    const results = await db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        title: appointments.title,
        starts_at: appointments.starts_at,
        ends_at: appointments.ends_at,
        status: appointments.status,
        notes: appointments.notes,
        invoiced: appointments.invoiced,
        invoice_ref: appointments.invoice_ref,
        is_group: appointments.is_group,
        group_size: appointments.group_size,
        rate_code: appointments.rate_code,
        created_at: appointments.created_at,
        updated_at: appointments.updated_at,
        deleted_at: appointments.deleted_at,
        client: {
          id: clients.id,
          name: clients.name,
        },
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.client_id, clients.id))
      .where(
        and(
          isNull(appointments.deleted_at),
          eq(appointments.status, 'completed'),
          eq(appointments.invoiced, false)
        )
      )
      .orderBy(appointments.starts_at);

    // Get participants for group appointments
    const appointmentIds = results.map(r => r.id);
    const participants = appointmentIds.length > 0 
      ? await db
          .select({
            id: appointmentParticipants.id,
            appointment_id: appointmentParticipants.appointment_id,
            client_id: appointmentParticipants.client_id,
            split_rate: appointmentParticipants.split_rate,
            client_name: clients.name,
          })
          .from(appointmentParticipants)
          .leftJoin(clients, eq(appointmentParticipants.client_id, clients.id))
          .where(inArray(appointmentParticipants.appointment_id, appointmentIds))
      : [];

    const participantsByAppointment = participants.reduce((acc, p) => {
      if (!acc[p.appointment_id]) acc[p.appointment_id] = [];
      acc[p.appointment_id].push({
        id: p.id,
        client_id: p.client_id,
        name: p.client_name || 'Unknown',
        split_rate: p.split_rate,
      });
      return acc;
    }, {} as Record<string, Participant[]>);

    return results.map(r => ({
      ...r,
      client: r.client_id && r.client?.id ? { id: r.client.id, name: r.client.name } : null,
      participants: participantsByAppointment[r.id] || [],
    })) as AppointmentWithClient[];
  },

  async markCompleted(id: string, notes: string | null): Promise<Appointment> {
    const results = await db
      .update(appointments)
      .set({
        status: 'completed',
        notes: notes,
        updated_at: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    return results[0];
  },

  /**
   * Mark a specific participant as invoiced (for group appointments)
   * Also checks if all participants are now invoiced, and updates the appointment accordingly
   */
  async markParticipantInvoiced(
    appointmentId: string,
    clientId: string,
    invoiceRef: string
  ): Promise<void> {
    // Update specific participant row
    await db
      .update(appointmentParticipants)
      .set({ invoiced: true, invoice_ref: invoiceRef, updated_at: new Date() })
      .where(
        and(
          eq(appointmentParticipants.appointment_id, appointmentId),
          eq(appointmentParticipants.client_id, clientId)
        )
      );

    // Check if ALL participants for this appointment are now invoiced
    const remaining = await db
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
      // All participants invoiced — mark the appointment itself
      await db
        .update(appointments)
        .set({ invoiced: true, updated_at: new Date() })
        .where(eq(appointments.id, appointmentId));
    }
  },
};