'use client';

import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttentionList } from './_components/AttentionList';
import { TodaySchedule } from './_components/TodaySchedule';
import { SkeletonDashboard } from '@/components/ui/enhanced-skeleton';
import { colors } from '@/styles/botanical';

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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary');
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        setData(result.data);
      } else {
        const errMsg = typeof result.error === 'string'
          ? result.error
          : result.error?.message || (res.status === 401 ? 'Please log in again.' : 'Failed to load dashboard');
        setError(errMsg);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-page min-h-screen p-4 md:p-6">
        <div className="max-w-[1200px] mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center" style={{ background: colors.page }}>
        <div className="max-w-[1200px] w-full">
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: colors.card,
              border: `1px solid ${colors.primary}`,
              boxShadow: '0 4px 12px rgba(62, 44, 28, 0.08)',
            }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: colors.heading }}>
              Unable to Load Dashboard
            </h2>
            <p className="mb-6" style={{ color: colors.secondary }}>
              {error || 'No data could be loaded.'}
            </p>
            <button
              onClick={fetchDashboard}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: colors.page }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <PageHeader
          icon={<Leaf size={16} style={{ color: colors.primaryBase }} />}
          title="Dashboard"
          subtitle="Your daily overview"
        />

        {/* Needs Attention */}
        <AttentionList
          overdueCount={data.invoices.overdue.count}
          overdueTotal={data.invoices.overdue.total}
          uninvoicedCount={data.uninvoiced_count}
          incompletePastEnd={data.today.incomplete_past_end}
          staleDraftsCount={data.invoices.stale_drafts}
        />

        {/* Today's Schedule */}
        <TodaySchedule appointments={data.today.appointments} onComplete={fetchDashboard} />
      </div>
    </div>
  );
}