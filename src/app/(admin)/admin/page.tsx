'use client';

import { Leaf, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { AttentionList } from './_components/AttentionList';
import { TodaySchedule } from './_components/TodaySchedule';
import { SkeletonDashboard } from '@/components/ui/enhanced-skeleton';
import { useDashboard } from '@/hooks/use-dashboard';
import { colors } from '@/styles/botanical';
import { toast } from 'sonner';

export default function DashboardPage() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    refresh,
  } = useDashboard();

  const handleRetry = () => {
    refresh();
  };

  // Loading state with skeleton
  if (isLoading && !data) {
    return (
      <div className="bg-page min-h-screen p-4 md:p-6">
        <div className="max-w-[1200px] mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
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
              {error.message || 'No data could be loaded.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 inline-flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
              }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="bg-page min-h-screen p-4 md:p-6">
        <div className="max-w-[1200px] mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: colors.page }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Header with refresh indicator */}
        <div className="flex items-center justify-between mb-4">
          <PageHeader
            icon={<Leaf size={16} style={{ color: colors.primaryBase }} />}
            title="Dashboard"
            subtitle="Your daily overview"
          />
          
          {/* Refresh button with loading state */}
          <motion.button
            onClick={() => {
              toast.promise(
                refresh(),
                {
                  loading: 'Refreshing...',
                  success: 'Dashboard updated',
                  error: 'Failed to refresh',
                }
              );
            }}
            disabled={isValidating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: colors.card,
              border: `1px solid ${colors.primary}`,
              opacity: isValidating ? 0.5 : 1,
            }}
          >
            <RefreshCw
              size={18}
              style={{ color: colors.muted }}
              className={isValidating ? 'animate-spin' : ''}
            />
          </motion.button>
        </div>

        {/* Content with revalidation indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={data ? 'loaded' : 'loading'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Needs Attention */}
            <AttentionList
              overdueCount={data.invoices.overdue.count}
              overdueTotal={data.invoices.overdue.total}
              uninvoicedCount={data.uninvoiced_count}
              incompletePastEnd={data.today.incomplete_past_end}
              staleDraftsCount={data.invoices.stale_drafts}
            />

            {/* Today's Schedule */}
            <TodaySchedule
              appointments={data.today.appointments}
              onComplete={() => refresh()}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}