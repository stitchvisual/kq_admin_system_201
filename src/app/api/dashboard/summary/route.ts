import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { requireAdmin } from '@/lib/auth';
import { appointmentsRepository } from '@/repositories/appointments.repository';
import { invoicesRepository } from '@/repositories/invoices.repository';
import { clientsRepository } from '@/repositories/clients.repository';

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    // Week boundaries (Monday 00:00 → Sunday end) — do not mutate `today` while computing
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch all data in parallel
    const [
      todayAppointments,
      weekAppointments,
      uninvoicedSessions,
      invoiceStats,
      recentInvoices,
      staleDrafts,
    ] = await Promise.all([
      // Today's appointments
      appointmentsRepository.findTodaysAppointments(),
      
      // Week's appointments
      appointmentsRepository.findByWeek(weekStart),
      
      // Uninvoiced completed sessions
      appointmentsRepository.findUninvoiced(),
      
      // Invoice summary stats
      invoicesRepository.getSummaryStats(),
      
      // Recent 5 invoices
      invoicesRepository.findAll(undefined, 1, 5),
      
      // Stale drafts (drafts older than 3 days)
      invoicesRepository.findStaleDrafts(3),
    ]);

    // Calculate today stats
    const todayCompleted = todayAppointments.filter((a) => a.status === 'completed').length;
    const todayRemaining = todayAppointments.filter((a) => 
      a.status === 'confirmed' || a.status === 'pending'
    ).length;

    // Calculate week stats
    const weekCompleted = weekAppointments.filter((a) => a.status === 'completed').length;
    const weekRemaining = weekAppointments.filter((a) => 
      a.status === 'confirmed' || a.status === 'pending'
    ).length;

    // Count incomplete sessions past their end time
    const incompletePastEndTime = todayAppointments.filter((a) => {
      if (a.status !== 'confirmed' && a.status !== 'pending') return false;
      return new Date(a.ends_at) <= new Date();
    }).length;

    return NextResponse.json({
      success: true,
      data: {
        today: {
          appointments: todayAppointments,
          total: todayAppointments.length,
          completed: todayCompleted,
          remaining: todayRemaining,
          incomplete_past_end: incompletePastEndTime,
        },
        week: {
          booked: weekAppointments.length,
          completed: weekCompleted,
          remaining: weekRemaining,
        },
        uninvoiced_count: uninvoicedSessions.length,
        invoices: {
          outstanding: invoiceStats.outstanding,
          overdue: invoiceStats.overdue,
          paid_this_month: invoiceStats.paid_this_month,
          draft: invoiceStats.draft,
          recent: recentInvoices,
          stale_drafts: staleDrafts.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}