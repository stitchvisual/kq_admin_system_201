/**
 * useDashboard Hook
 * =================
 *
 * Custom hook for fetching and managing dashboard data with:
 * - Automatic caching and revalidation
 * - Optimistic updates for better UX
 * - Error handling with retry
 */

import useSWR from 'swr';
import { useCallback } from 'react';

interface Participant {
  id: string;
  client_id: string;
  name: string;
  split_rate: string;
}

interface AppointmentWithClient {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  is_group?: boolean;
  client: {
    id: string;
    name: string;
  } | null;
  participants?: Participant[];
}

interface DashboardData {
  today: {
    appointments: AppointmentWithClient[];
    incomplete_past_end: number;
  };
  uninvoiced_count: number;
  invoices: {
    overdue: { count: number; total: number };
    stale_drafts: number;
  };
}

const fetcher = async (url: string): Promise<DashboardData> => {
  const res = await fetch(url);
  const result = await res.json().catch(() => ({}));
  
  if (!res.ok || !result.success) {
    const errMsg = typeof result.error === 'string'
      ? result.error
      : result.error?.message || (res.status === 401 ? 'Please log in again.' : 'Failed to load dashboard');
    throw new Error(errMsg);
  }
  
  return result.data;
};

export function useDashboard() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardData>(
    '/api/dashboard/summary',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 2,
    }
  );

  /**
   * Optimistically update an appointment's status
   * Used when completing a session for instant UI feedback
   */
  const optimisticallyCompleteAppointment = useCallback((appointmentId: string) => {
    if (!data) return;

    mutate(
      {
        ...data,
        today: {
          ...data.today,
          appointments: data.today.appointments.map((apt: AppointmentWithClient) =>
            apt.id === appointmentId
              ? { ...apt, status: 'completed' }
              : apt
          ),
          incomplete_past_end: Math.max(0, data.today.incomplete_past_end - 1),
        },
      },
      false // Don't revalidate immediately
    );
  }, [data, mutate]);

  /**
   * Revert an optimistic update if the API call fails
   */
  const revertAppointmentStatus = useCallback((appointmentId: string, originalStatus: string) => {
    if (!data) return;

    mutate(
      {
        ...data,
        today: {
          ...data.today,
          appointments: data.today.appointments.map((apt: AppointmentWithClient) =>
            apt.id === appointmentId
              ? { ...apt, status: originalStatus }
              : apt
          ),
        },
      },
      false
    );
  }, [data, mutate]);

  /**
   * Refresh dashboard data
   */
  const refresh = useCallback(() => {
    return mutate();
  }, [mutate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh,
    optimisticallyCompleteAppointment,
    revertAppointmentStatus,
  };
}

export type { DashboardData, AppointmentWithClient, Participant };