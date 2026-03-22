'use client';

import { useEffect, useState } from 'react';
import { Leaf, Calendar, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard, StatCardGrid } from '@/components/shared/StatCard';
import { AttentionList } from './_components/AttentionList';
import { TodaySchedule } from './_components/TodaySchedule';
import { RecentInvoices } from './_components/RecentInvoices';
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

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: string;
  due_date: string;
  client: {
    name: string;
  };
}

interface DashboardData {
  today: {
    appointments: AppointmentWithClient[];
    total: number;
    completed: number;
    remaining: number;
    incomplete_past_end: number;
  };
  week: {
    booked: number;
    completed: number;
    remaining: number;
  };
  uninvoiced_count: number;
  invoices: {
    outstanding: { count: number; total: number };
    overdue: { count: number; total: number };
    paid_this_month: { count: number; total: number };
    draft: { count: number; total: number };
    recent: Invoice[];
    stale_drafts: number;
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
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

        {/* Stat Cards */}
        <StatCardGrid>
          <StatCard
            icon={<Calendar size={18} />}
            label="Today"
            value={data.today.total}
            subtext={data.today.remaining > 0 ? `${data.today.completed} done, ${data.today.remaining} to go` : 'All done today'}
            color="#7895aa"
            bg="rgba(120,149,170,0.12)"
            borderColor="rgba(120,149,170,0.3)"
            isZero={data.today.total === 0}
            href="#today-schedule"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="This Week"
            value={data.week.booked}
            subtext={data.week.remaining > 0 ? `${data.week.completed} done, ${data.week.remaining} remaining` : 'Week complete'}
            color="#82a091"
            bg="rgba(130,160,145,0.12)"
            borderColor="rgba(130,160,145,0.3)"
            isZero={data.week.booked === 0}
            href="/admin/appointments"
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Uninvoiced"
            value={data.uninvoiced_count}
            subtext={data.uninvoiced_count > 0 ? 'Ready to bill →' : 'All caught up'}
            color="#b69470"
            bg="rgba(182,148,112,0.12)"
            borderColor="rgba(182,148,112,0.3)"
            highlight={data.uninvoiced_count > 0}
            isZero={data.uninvoiced_count === 0}
            href="/admin/invoices/generate"
          />
          <StatCard
            icon={<DollarSign size={18} />}
            label="Outstanding"
            value={formatCurrency(data.invoices.outstanding.total)}
            subtext={data.invoices.outstanding.count > 0 ? `${data.invoices.outstanding.count} ${data.invoices.outstanding.count === 1 ? 'invoice' : 'invoices'} →` : 'All paid'}
            color="#7895aa"
            bg="rgba(120,149,170,0.12)"
            borderColor="rgba(120,149,170,0.3)"
            highlight={data.invoices.outstanding.count > 0}
            isZero={data.invoices.outstanding.count === 0}
            href="/admin/invoices?status=issued"
          />
        </StatCardGrid>

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

        {/* Recent Invoices */}
        <RecentInvoices invoices={data.invoices.recent} onUpdate={fetchDashboard} />
      </div>
    </div>
  );
}