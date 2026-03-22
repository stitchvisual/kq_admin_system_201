// src/lib/resend.ts
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const resend = apiKey ? new Resend(apiKey) : null;

export function isResendConfigured(): boolean {
  return Boolean(apiKey);
}

export function getFromAddress(): string {
  return fromEmail.includes('@')
    ? `${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'KQ Collective'} <${fromEmail}>`
    : 'KQ Collective <onboarding@resend.dev>';
}
