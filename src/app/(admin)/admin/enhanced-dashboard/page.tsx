'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, FileText, TrendingUp, Bell } from 'lucide-react';
import { AnimatedCard, HoverEffect } from '@/components/ui/advanced-animations';
import {
  MicroInteraction,
  NotificationBadge,
  ProgressRing,
  FloatingActionButton,
  StatusIndicator,
} from '@/components/ui/micro-interactions';
import { SmoothReveal, StaggeredList } from '@/components/ui/page-transitions';
import { EnhancedButton } from '@/components/ui/enhanced-button';

export default function EnhancedDashboard() {
  const [notifications, setNotifications] = useState(3);
  const [progress, setProgress] = useState(75);
  const [status, setStatus] = useState<'online' | 'offline' | 'busy' | 'away'>('online');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10 - 5;
        return Math.max(0, Math.min(100, newProgress));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Today's Appointments",
      value: '12',
      subtitle: '3 completed, 9 remaining',
      icon: <Calendar className="w-5 h-5" />,
      color: 'rgba(120,149,170,0.12)',
      borderColor: 'rgba(120,149,170,0.3)',
      textColor: '#2d4a5c',
    },
    {
      title: 'This Week',
      value: '45',
      subtitle: '28 completed, 17 remaining',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'rgba(130,160,145,0.12)',
      borderColor: 'rgba(130,160,145,0.3)',
      textColor: '#3a5a45',
    },
    {
      title: 'Uninvoiced Sessions',
      value: '8',
      subtitle: 'Ready to bill',
      icon: <FileText className="w-5 h-5" />,
      color: 'rgba(182,148,112,0.15)',
      borderColor: 'rgba(182,148,112,0.5)',
      textColor: '#6b4d2f',
      badge: true,
    },
    {
      title: 'Outstanding',
      value: '$12,450',
      subtitle: '5 invoices',
      icon: <Users className="w-5 h-5" />,
      color: 'rgba(120,149,170,0.15)',
      borderColor: 'rgba(120,149,170,0.5)',
      textColor: '#2d4a5c',
      badge: true,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      client: 'Sarah Johnson',
      activity: 'Appointment completed',
      time: '2 hours ago',
      status: 'completed',
    },
    { id: 2, client: 'Mike Chen', activity: 'Invoice sent', time: '3 hours ago', status: 'issued' },
    {
      id: 3,
      client: 'Emma Wilson',
      activity: 'New appointment booked',
      time: '4 hours ago',
      status: 'pending',
    },
    {
      id: 4,
      client: 'David Brown',
      activity: 'Payment received',
      time: '5 hours ago',
      status: 'paid',
    },
    {
      id: 5,
      client: 'Lisa Anderson',
      activity: 'Session notes updated',
      time: '6 hours ago',
      status: 'updated',
    },
  ];

  return (
    <div className="min-h-screen bg-page p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header with enhanced interactions */}
        <SmoothReveal animation="fade-up" duration={600}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-[1.75rem] font-semibold text-heading flex items-center gap-2">
                <MicroInteraction trigger="hover" intensity="subtle">
                  <Bell className="w-6 h-6 text-primaryBase opacity-80" />
                </MicroInteraction>
                Good afternoon, Kirsten
              </h1>
              <StatusIndicator status={status} pulse={true} />
            </div>
            <div className="flex items-center gap-4">
              <MicroInteraction trigger="hover">
                <NotificationBadge count={notifications} variant="primary" pulse={true} />
              </MicroInteraction>
              <FloatingActionButton
                icon={<Plus className="w-6 h-6" />}
                onClick={() => console.log('Add new')}
                tooltip="Add New Appointment"
                size="md"
              />
            </div>
          </div>
        </SmoothReveal>

        {/* Enhanced Stat Cards with Animations */}
        <SmoothReveal animation="fade-up" delay={200} duration={600}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {statCards.map((card, index) => (
              <AnimatedCard
                key={index}
                delay={index * 100}
                direction="up"
                className="p-5 rounded-xl border"
                style={{
                  background: card.color,
                  border: `1px solid ${card.borderColor}`,
                  cursor: 'pointer',
                }}
                onClick={() => console.log(`Clicked ${card.title}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[0.72rem] font-semibold uppercase tracking-wider opacity-90"
                    style={{ color: card.textColor }}
                  >
                    {card.title}
                  </span>
                  <div style={{ color: card.textColor, opacity: 0.8 }}>{card.icon}</div>
                </div>
                <div>
                  <div className="font-heading text-[1.5rem] font-bold text-heading mb-1">
                    {card.value}
                  </div>
                  <div className="text-[0.75rem] opacity-80" style={{ color: card.textColor }}>
                    {card.subtitle}
                  </div>
                </div>
                {card.badge && (
                  <div className="absolute top-2 right-2">
                    <MicroInteraction trigger="hover" intensity="subtle">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: '#a04040' }}
                      />
                    </MicroInteraction>
                  </div>
                )}
              </AnimatedCard>
            ))}
          </div>
        </SmoothReveal>

        {/* Progress and Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <SmoothReveal animation="fade-left" delay={400} duration={600}>
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-heading text-lg font-semibold text-heading mb-4">
                Weekly Progress
              </h3>
              <div className="flex items-center justify-center mb-4">
                <ProgressRing
                  progress={progress}
                  size={120}
                  strokeWidth={8}
                  animated={true}
                  color="hsl(130, 13%, 56%)"
                />
              </div>
              <div className="text-center">
                <p className="text-body text-sm mb-2">
                  {Math.round(progress)}% of weekly target completed
                </p>
                <EnhancedButton variant="outline" size="sm" onClick={() => setProgress(0)}>
                  Reset Progress
                </EnhancedButton>
              </div>
            </div>
          </SmoothReveal>

          <SmoothReveal animation="fade-right" delay={600} duration={600}>
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-heading">Recent Activity</h3>
                <MicroInteraction trigger="hover">
                  <button
                    onClick={() => setNotifications(prev => prev + 1)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </MicroInteraction>
              </div>
              <StaggeredList delay={100} duration={400}>
                {recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium text-heading">{activity.client}</p>
                        <p className="text-xs text-muted-foreground">{activity.activity}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </StaggeredList>
            </div>
          </SmoothReveal>
        </div>

        {/* Interactive Demo Section */}
        <SmoothReveal animation="fade-up" delay={800} duration={600}>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-heading text-lg font-semibold text-heading mb-4">
              Interactive Elements
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <MicroInteraction trigger="click" intensity="normal">
                  <button className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6" />
                  </button>
                </MicroInteraction>
                <p className="text-sm text-muted-foreground">Click Interaction</p>
              </div>

              <div className="text-center">
                <HoverEffect effect="glow" intensity="subtle">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                </HoverEffect>
                <p className="text-sm text-muted-foreground">Glow Effect</p>
              </div>

              <div className="text-center">
                <AnimatedCard className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6" />
                </AnimatedCard>
                <p className="text-sm text-muted-foreground">Animated Card</p>
              </div>
            </div>
          </div>
        </SmoothReveal>
      </div>
    </div>
  );
}
