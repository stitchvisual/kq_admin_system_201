import { appointmentsRepository, type AppointmentWithClient } from '@/repositories/appointments.repository';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { getWeekStart } from '@/lib/date-utils';
import type { NewAppointment, NewAppointmentParticipant } from '@/db/schema';

type CreateAppointmentInput = {
  client_id?: string;  // Optional for group appointments
  starts_at: string;  // ISO string
  ends_at: string;    // ISO string
  title?: string;
  notes?: string;
  is_group?: boolean;
  group_size?: number;
  rate_code?: string;  // NDIS rate code for group sessions
  participants?: string[];  // Array of client IDs - split is calculated evenly
  status?: 'pending' | 'confirmed';  // Allow setting status on creation
};

type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export const appointmentsService = {
  /**
   * List all appointments for a given week
   * Uses 24h buffer on each side to avoid missing appointments near week boundaries
   * due to timezone differences (e.g. Monday 9am Sydney = Sunday evening UTC)
   */
  async list(weekStart?: string): Promise<AppointmentWithClient[]> {
    let startDate: Date;
    if (weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      const [y, m, d] = weekStart.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      startDate = !isNaN(parsed.getTime()) ? parsed : getWeekStart(new Date());
    } else {
      startDate = getWeekStart(new Date());
    }
    return appointmentsRepository.findByWeek(startDate, { bufferHours: 24 });
  },

  async getTodaysAppointments(): Promise<AppointmentWithClient[]> {
    return appointmentsRepository.findTodaysAppointments();
  },

  /**
   * Get a single appointment by ID
   */
  async getById(id: string): Promise<AppointmentWithClient> {
    const appointment = await appointmentsRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Appointment', id);
    }
    return appointment;
  },

  /**
   * Create a new appointment with overlap checking
   * Handles both solo and group appointments
   */
  async create(data: CreateAppointmentInput): Promise<AppointmentWithClient> {
    // Validate required fields
    if (!data.starts_at) {
      throw new ValidationError('Start time is required');
    }
    if (!data.ends_at) {
      throw new ValidationError('End time is required');
    }

    const startsAt = new Date(data.starts_at);
    const endsAt = new Date(data.ends_at);

    // Validate end is after start
    if (endsAt <= startsAt) {
      throw new ValidationError('End time must be after start time');
    }

    // Check for global overlap (KQ is a solo provider)
    const hasOverlap = await appointmentsRepository.checkOverlap(startsAt, endsAt);
    if (hasOverlap) {
      throw new ValidationError('This time slot overlaps with an existing appointment');
    }

    // Validate based on appointment type
    if (data.is_group) {
      // Group appointment validation
      if (!data.participants || data.participants.length < 2) {
        throw new ValidationError('Group appointments require at least 2 participants');
      }
      if (!data.rate_code) {
        throw new ValidationError('Rate code is required for group appointments');
      }
    } else {
      // Solo appointment validation
      if (!data.client_id) {
        throw new ValidationError('Client is required for solo appointments');
      }
    }

    // Create appointment
    const created = await appointmentsRepository.create({
      client_id: data.is_group ? null : data.client_id!,
      title: data.title || null,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: data.notes || null,
      status: data.status || 'confirmed',
      invoiced: false,
      is_group: data.is_group || false,
      group_size: data.is_group ? data.participants!.length : 1,
      rate_code: data.rate_code || null,
    });

    // Create participants for group appointments with even split
    if (data.is_group && data.participants) {
      // Calculate split rate: each participant gets an equal fraction of the group rate
      // Using toFixed(6) for precision to handle floating-point arithmetic
      // Example: 3 participants = 0.333333 (1/3), which × $67.56 = $22.52 per participant
      // Note: This precision is adequate for NDIS pricing (typically whole dollars or 2 decimal places)
      const splitRate = (1 / data.participants.length).toFixed(6);
      const participantRecords: NewAppointmentParticipant[] = data.participants.map(clientId => ({
        appointment_id: created.id,
        client_id: clientId,
        split_rate: splitRate,
      }));
      await appointmentsRepository.createParticipants(participantRecords);
    }

    // Fetch and return with client data
    const appointment = await appointmentsRepository.findById(created.id);
    if (!appointment) {
      throw new NotFoundError('Appointment', created.id);
    }
    
    return appointment;
  },

  /**
   * Update an existing appointment with overlap checking
   */
  async update(id: string, data: UpdateAppointmentInput): Promise<AppointmentWithClient> {
    // Verify appointment exists
    const existing = await appointmentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }

    const startsAt = data.starts_at ? new Date(data.starts_at) : existing.starts_at;
    const endsAt = data.ends_at ? new Date(data.ends_at) : existing.ends_at;

    // If updating time, validate and check overlap
    if (data.starts_at || data.ends_at) {
      if (endsAt <= startsAt) {
        throw new ValidationError('End time must be after start time');
      }

      // Check global overlap, excluding current appointment
      const hasOverlap = await appointmentsRepository.checkOverlap(startsAt, endsAt, id);
      if (hasOverlap) {
        throw new ValidationError('This time slot overlaps with an existing appointment');
      }
    }

    // Build update data
    const updateData: Partial<NewAppointment> = {};
    if (data.client_id !== undefined) updateData.client_id = data.client_id || null;
    if (data.title !== undefined) updateData.title = data.title || null;
    if (data.starts_at) updateData.starts_at = startsAt;
    if (data.ends_at) updateData.ends_at = endsAt;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.rate_code !== undefined) updateData.rate_code = data.rate_code || null;
    if (data.status !== undefined) updateData.status = data.status;

    await appointmentsRepository.update(id, updateData);

    // Update participants if provided for group appointments
    // Only allow participant updates for group appointments
    if (data.participants !== undefined) {
      if (!existing.is_group) {
        throw new ValidationError('Cannot update participants on a solo appointment. Solo appointments use client_id field instead.');
      }
      
      // Delete existing participants
      await appointmentsRepository.deleteParticipants(id);
      
      // Create new participants with even split
      if (data.participants.length > 0) {
        // Calculate split rate: each participant gets an equal fraction of the group rate
        // Using toFixed(6) for precision to handle floating-point arithmetic
        // Example: 3 participants = 0.333333 (1/3), which × $67.56 = $22.52 per participant
        // Note: This precision is adequate for NDIS pricing (typically whole dollars or 2 decimal places)
        const splitRate = (1 / data.participants.length).toFixed(6);
        const participantRecords: NewAppointmentParticipant[] = data.participants.map(clientId => ({
          appointment_id: id,
          client_id: clientId,
          split_rate: splitRate,
        }));
        await appointmentsRepository.createParticipants(participantRecords);
        
        // Update group size
        await appointmentsRepository.update(id, { group_size: data.participants.length });
      }
    }

    // Fetch and return updated appointment
    const updated = await appointmentsRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Appointment', id);
    }
    return updated;
  },

  /**
   * Cancel (soft delete) an appointment
   */
  async delete(id: string): Promise<{ success: boolean }> {
    // Verify appointment exists
    const existing = await appointmentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }

    // Check if appointment is invoiced
    if (existing.invoiced) {
      throw new ValidationError('Cannot cancel an invoiced appointment');
    }

    // Soft delete
    await appointmentsRepository.softDelete(id);

    return { success: true };
  },

  async getWeekStats(weekStart?: string): Promise<{ booked: number; completed: number; remaining: number }> {
    let startDate: Date;
    if (weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      const parsed = new Date(weekStart);
      startDate = !isNaN(parsed.getTime()) ? parsed : getWeekStart(new Date());
    } else {
      startDate = getWeekStart(new Date());
    }
    const stats = await appointmentsRepository.getWeekStats(startDate);
    return {
      ...stats,
      remaining: stats.booked - stats.completed,
    };
  },

  async getUninvoiced(): Promise<AppointmentWithClient[]> {
    return appointmentsRepository.findUninvoiced();
  },

  async complete(id: string, notes?: string): Promise<AppointmentWithClient> {
    // Verify appointment exists
    const existing = await appointmentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Appointment', id);
    }

    // Check if already completed
    if (existing.status === 'completed') {
      throw new ValidationError('Appointment is already completed');
    }

    // Check if cancelled
    if (existing.status === 'cancelled') {
      throw new ValidationError('Cannot complete a cancelled appointment');
    }

    // Mark as completed with notes
    await appointmentsRepository.markCompleted(id, notes || null);

    // Fetch and return updated appointment
    const updated = await appointmentsRepository.findById(id);
    if (!updated) {
      throw new NotFoundError('Appointment', id);
    }
    return updated;
  },

  async getUninvoicedCount(): Promise<number> {
    const uninvoiced = await appointmentsRepository.findUninvoiced();
    return uninvoiced.length;
  },
};