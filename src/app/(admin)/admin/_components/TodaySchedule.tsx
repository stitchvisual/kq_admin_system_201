'use client';

import { useState } from 'react';
import { Clock, CheckCircle, Loader2, Users } from 'lucide-react';
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

  const handleQuickComplete = async (appointmentId: string) => {
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
        toast.error(data.error?.message ?? 'Failed to complete session');
      }
    } catch (error) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}>
        {appointments.map((appointment) => {
          const start = new Date(appointment.starts_at);
          const end = new Date(appointment.ends_at);
          const isPastEndTime = end <= new Date();
          const canComplete = 
            (appointment.status === 'confirmed' || appointment.status === 'pending') && 
            isPastEndTime;

          const statusColor =
            appointment.status === 'completed'
              ? { bg: 'rgba(90,138,96,0.15)', text: '#3a5a3e', dot: '#5a8a60' }
              : appointment.status === 'confirmed'
              ? { bg: 'rgba(120,149,170,0.15)', text: '#2d4a5c', dot: '#7895aa' }
              : { bg: 'rgba(182,148,112,0.15)', text: '#6b4d2f', dot: '#b69470' };

          const clientName = appointment.is_group
            ? 'Group Session'
            : appointment.client?.name ?? 'Unknown';

          const participantNames = appointment.participants?.map(p => p.name).join(', ');

          return (
            <div
              key={appointment.id}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = shadows.hover;
                el.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = shadows.subtle;
                el.style.transform = '';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: 10,
                background: colors.card,
                border: `1px solid ${colors.primary}`,
                boxShadow: shadows.subtle,
                transition: 'box-shadow 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)',
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
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(130,160,145,0.12)',
                          color: '#3a5a45',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        <Users size={10} /> {appointment.participants?.length || 0}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: colors.secondary }}>
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
                  {appointment.status}
                </span>

                {canComplete && (
                  <button
                    onClick={() => handleQuickComplete(appointment.id)}
                    disabled={completing === appointment.id}
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
                      transition: 'all 150ms ease',
                    }}
                  >
                    {completing === appointment.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle size={13} />
                    )}
                    Complete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: typography.body,
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: colors.muted,
  marginBottom: '0.75rem',
};