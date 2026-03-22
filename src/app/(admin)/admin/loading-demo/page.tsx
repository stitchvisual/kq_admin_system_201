'use client';

import React, { useState } from 'react';
import { EnhancedButton, SuccessButton, ErrorButton } from '@/components/ui/enhanced-button';
import {
  SkeletonDashboard,
  SkeletonCard,
  SkeletonTable,
  SkeletonStatCard,
} from '@/components/ui/enhanced-skeleton';
import { useEnhancedLoading } from '@/hooks/use-enhanced-loading';

export default function LoadingDemo() {
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [successState, setSuccessState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handleSuccessClick = () => {
    setSuccessState('loading');
    setTimeout(() => {
      setSuccessState(Math.random() > 0.5 ? 'success' : 'error');
      setTimeout(() => setSuccessState('idle'), 2000);
    }, 1500);
  };

  const { isLoading, startLoading, stopLoading } = useEnhancedLoading(false);

  return (
    <div className="min-h-screen bg-page p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-heading mb-2">Enhanced Loading States Demo</h1>
          <p className="text-body">
            Demonstrating polished loading experiences and micro-interactions
          </p>
        </div>

        {/* Button Loading States */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-xl text-heading mb-4">Enhanced Button Loading States</h2>
          <div className="flex flex-wrap gap-4">
            <EnhancedButton
              loading={buttonLoading}
              onClick={handleButtonClick}
              loadingText="Processing..."
            >
              Click to Load
            </EnhancedButton>

            <EnhancedButton
              variant="secondary"
              loading={buttonLoading}
              onClick={handleButtonClick}
              loadingText="Loading..."
            >
              Secondary Loading
            </EnhancedButton>

            <EnhancedButton variant="outline" loading={buttonLoading} onClick={handleButtonClick}>
              Outline Loading
            </EnhancedButton>

            {successState === 'idle' && (
              <EnhancedButton onClick={handleSuccessClick}>Simulate Action</EnhancedButton>
            )}

            {successState === 'loading' && <EnhancedButton loading>Processing...</EnhancedButton>}

            {successState === 'success' && <SuccessButton>Action Completed!</SuccessButton>}

            {successState === 'error' && <ErrorButton>Action Failed</ErrorButton>}
          </div>
        </section>

        {/* Skeleton Variations */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-xl text-heading mb-4">Enhanced Skeleton Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-body text-lg text-body mb-3">Dashboard Skeleton</h3>
              <SkeletonDashboard />
            </div>

            <div>
              <h3 className="font-body text-lg text-body mb-3">Stat Card Skeleton</h3>
              <SkeletonStatCard count={4} />
            </div>

            <div>
              <h3 className="font-body text-lg text-body mb-3">Table Skeleton</h3>
              <SkeletonTable rows={5} cols={4} />
            </div>

            <div>
              <h3 className="font-body text-lg text-body mb-3">Card Skeleton</h3>
              <SkeletonCard count={3} />
            </div>
          </div>
        </section>

        {/* Progressive Loading Demo */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-xl text-heading mb-4">Progressive Loading Demo</h2>
          <div className="flex gap-4 mb-6">
            <EnhancedButton onClick={() => setSimulateLoading(!simulateLoading)}>
              {simulateLoading ? 'Stop Loading' : 'Start Loading'}
            </EnhancedButton>
          </div>

          {simulateLoading && (
            <div className="space-y-6">
              <div className="loading-phase-1">
                <SkeletonStatCard count={2} />
              </div>
              <div className="loading-phase-2">
                <SkeletonTable rows={3} cols={3} />
              </div>
              <div className="loading-phase-3">
                <SkeletonCard count={2} />
              </div>
              <div className="loading-phase-4">
                <SkeletonTable rows={2} cols={4} />
              </div>
            </div>
          )}
        </section>

        {/* Animation Showcase */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-xl text-heading mb-4">Animation Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primaryBase rounded-lg mx-auto mb-2 animate-bounce-in"></div>
              <p className="text-sm text-body">Bounce In</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-lg mx-auto mb-2 animate-shake"></div>
              <p className="text-sm text-body">Shake</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-lg mx-auto mb-2 skeleton-shimmer"></div>
              <p className="text-sm text-body">Shimmer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive rounded-lg mx-auto mb-2 spinner-md"></div>
              <p className="text-sm text-body">Spinner</p>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-xl text-heading mb-4">Usage Guidelines</h2>
          <div className="space-y-4 text-body">
            <div>
              <h3 className="font-semibold text-heading mb-2">Best Practices:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Use staggered animations for lists and grids</li>
                <li>Show loading states for all user-initiated actions</li>
                <li>Provide visual feedback for success/error states</li>
                <li>Keep loading animations under 2 seconds when possible</li>
                <li>Use progressive loading for better perceived performance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-heading mb-2">Implementation Tips:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Use the EnhancedButton component for all interactive buttons</li>
                <li>Implement skeleton screens that match your content structure</li>
                <li>Add smooth transitions between loading and loaded states</li>
                <li>Consider using the useEnhancedLoading hook for complex loading scenarios</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
