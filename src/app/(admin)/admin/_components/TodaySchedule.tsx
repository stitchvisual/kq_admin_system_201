'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Loader2, Users } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';
import { toast } from 'sonner';
import { colors, shadows, radii, typography } from '@/styles/botanical';

interface Participant {
  id: string;
  client_id: string;
  name: string;
  split_rate: string;
}

interface Appointment {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  is_group?: boolean;
  client: { id: string; name: string } | null;
  participants?: Participant[];
}

interface TodayScheduleProps {
  appointments: Appointment[];
  onComplete?: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TodaySchedule({ appointments, onComplete }: TodayScheduleProps) {
  const [completing, setCompleting] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});

  const handleQuickComplete = async (appointmentId: string) => {
    // Optimistically flip to completed for instant UI feedback.
    setOptimisticStatuses(prev => ({ ...prev, [appointmentId]: 'completed' }));
    setCompleting(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Session marked as complete');
        onComplete?.();
      } else {
        setOptimisticStatuses(prev => {
          const { [appointmentId]: _, ...rest } = prev;
          return rest;
        });
        toast.error(data.error?.message ?? 'Failed to complete session');
      }
    } catch (error) {
      setOptimisticStatuses(prev => {
        const { [appointmentId]: _, ...rest } = prev;
        return rest;
      });
      console.error('Failed to complete session:', error);
      toast.error('Failed to complete session');
    } finally {
      setCompleting(null);
    }
  };

  if (appointments.length === 0) {
    return (
      <div id="today-schedule" style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionHeading}>Today's Schedule</h2>
        <div
          style={{
            padding: '2.25rem 1rem',
            borderRadius: 12,
            background: colors.card,
            border: `1px solid ${colors.primary}`,
            boxShadow: shadows.subtle,
            textAlign: 'center',
          }}
        >
          <Clock size={32} style={{ color: colors.muted, margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.9rem', color: colors.secondary, margin: 0 }}>
            No sessions scheduled for today
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="today-schedule" style={{ marginBottom: '1.5rem' }}>
      <h2 style={sectionHeading}>Today's Schedule</h2>
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {appointments.map((appointment) => {
          const start = new Date(appointment.starts_at);
          const end = new Date(appointment.ends_at);
          const isPastEndTime = end <= new Date();
          const effectiveStatus = optimisticStatuses[appointment.id] ?? appointment.status;
          const canComplete = 
            (effectiveStatus === 'confirmed' || effectiveStatus === 'pending') && 
            isPastEndTime;

          const statusColor =
            effectiveStatus === 'completed'
              ? { bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)', dot: 'var(--status-completed-dot)' }
              : effectiveStatus === 'confirmed'
              ? { bg: 'var(--status-confirmed-bg)', text: 'var(--status-confirmed-text)', dot: 'var(--status-confirmed-dot)' }
              : { bg: 'var(--status-pending-bg)', text: 'var(--status-pending-text)', dot: 'var(--status-pending-dot)' };

          const clientName = appointment.is_group
            ? 'Group Session'
            : appointment.client?.name ?? 'Unknown';

          const participantNames = appointment.participants?.map(p => p.name).join(', ');

          return (
            <motion.div
              key={appointment.id}
              variants={fadeUp}
              whileHover={{
                boxShadow: shadows.hover,
                y: -1,
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.995 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: 10,
                background: colors.card,
                border: `1px solid ${colors.primary}`,
                boxShadow: shadows.subtle,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusColor.dot,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.heading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {clientName}
                    </span>
                    {appointment.is_group && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 'var(--font-size-badge)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--status-group-bg)',
                          color: 'var(--status-group-text)',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        <Users size={10} /> {appointment.participants?.length || 0}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-meta)', color: colors.secondary }}>
                    {formatTime(start)} - {formatTime(end)}
                  </div>
                  {appointment.is_group && participantNames && (
                    <div style={{ fontSize: '0.75rem', color: colors.muted, marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', wordBreak: 'break-word' }}>
                      {participantNames}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 99,
                    background: statusColor.bg,
                    color: statusColor.text,
                    textTransform: 'capitalize',
                  }}
                >
                  {effectiveStatus}
                </span>

                {canComplete && (
                  <motion.button
                    type="button"
                    onClick={() => handleQuickComplete(appointment.id)}
                    disabled={completing === appointment.id}
                    whileHover={{ opacity: 0.9 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      height: 32,
                      padding: '0 12px',
                      borderRadius: 7,
                      border: 'none',
                      background: completing === appointment.id
                        ? colors.primaryHover
                        : `linear-gradient(135deg, ${colors.primaryBase} 0%, ${colors.primaryHover} 100%)`,
                      color: '#fff',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: completing === appointment.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      opacity: completing === appointment.id ? 0.65 : 1,
                      boxShadow: completing === appointment.id ? 'none' : `${shadows.button}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    }}
                  >
                    {completing === appointment.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                    Complete
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: typography.body,
  fontSize: 'var(--font-size-badge)',
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: colors.muted,
  marginBottom: '0.75rem',
};