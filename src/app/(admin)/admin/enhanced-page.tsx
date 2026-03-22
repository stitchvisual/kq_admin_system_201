"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { DashboardStatCards } from "./_components/DashboardStatCards";
import { AttentionList } from "./_components/AttentionList";
import { TodaySchedule } from "./_components/TodaySchedule";
import { RecentInvoices } from "./_components/RecentInvoices";
import { SkeletonDashboard } from "@/components/ui/enhanced-skeleton";
import { useEnhancedLoading } from "@/hooks/use-enhanced-loading";
import { SmoothReveal } from "@/components/ui/page-transitions";

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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useEnhancedLoading(true);

  const fetchDashboard = async () => {
    startLoading();
    try {
      const res = await fetch('/api/dashboard/summary');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        stopLoading();
      } else {
        setLoadingError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoadingError('Network error occurred');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-page min-h-screen p-6">
        <div className="max-w-[1200px] mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-page min-h-screen p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-card rounded-xl p-8 text-center">
            <h2 className="font-heading text-xl text-heading mb-4">Unable to Load Dashboard</h2>
            <p className="text-body mb-6">{error}</p>
            <button
              onClick={fetchDashboard}
              className="bg-primaryBase text-white px-6 py-2 rounded-lg hover:bg-primaryHover transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-page min-h-screen p-6 animate-in fade-in-0 duration-500">
      <div className="max-w-[1200px] mx-auto">
        {/* Header with greeting */}
        <SmoothReveal animation="fade-up" delay={0} duration={500}>
          <header className="flex items-center justify-between mb-6 py-4">
            <div>
              <h1 className="font-heading text-[1.75rem] font-semibold text-heading m-0 mb-1 flex items-center gap-2">
                <Leaf size={24} className="text-primaryBase opacity-80" />
                {getGreeting()}, Kirsten
              </h1>
              <p className="text-[0.9rem] text-body m-0">
                {formatDate(new Date())}
              </p>
            </div>
          </header>
        </SmoothReveal>

        {/* Stat Cards */}
        <SmoothReveal animation="fade-up" delay={100} duration={500}>
          <DashboardStatCards
            todayCount={data.today.total}
            todayCompleted={data.today.completed}
            todayRemaining={data.today.remaining}
            weekBooked={data.week.booked}
            weekCompleted={data.week.completed}
            weekRemaining={data.week.remaining}
            uninvoicedCount={data.uninvoiced_count}
            outstandingAmount={data.invoices.outstanding.total}
            outstandingCount={data.invoices.outstanding.count}
          />
        </SmoothReveal>

        {/* Needs Attention */}
        <SmoothReveal animation="fade-up" delay={200} duration={500}>
          <AttentionList
            overdueCount={data.invoices.overdue.count}
            overdueTotal={data.invoices.overdue.total}
            uninvoicedCount={data.uninvoiced_count}
            incompletePastEnd={data.today.incomplete_past_end}
            staleDraftsCount={data.invoices.stale_drafts}
          />
        </SmoothReveal>

        {/* Today's Schedule */}
        <SmoothReveal animation="fade-up" delay={300} duration={500}>
          <TodaySchedule appointments={data.today.appointments} onComplete={fetchDashboard} />
        </SmoothReveal>

        {/* Recent Invoices */}
        <SmoothReveal animation="fade-up" delay={400} duration={500}>
          <RecentInvoices invoices={data.invoices.recent} onUpdate={fetchDashboard} />
        </SmoothReveal>
      </div>
    </div>
  );
}