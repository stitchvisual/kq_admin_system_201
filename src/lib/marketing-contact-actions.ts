'use server';

import { Resend } from 'resend';

const schema = {
  name: (v: unknown) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null),
  email: (v: unknown) =>
    typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? v.trim() : null,
  subject: (v: unknown) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null),
  message: (v: unknown) => (typeof v === 'string' && v.trim().length >= 10 ? v.trim() : null),
};

export type ContactFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const name = schema.name(formData.get('name'));
  const email = schema.email(formData.get('email'));
  const subject = schema.subject(formData.get('subject'));
  const message = schema.message(formData.get('message'));

  const errors: Record<string, string[]> = {};
  if (!name) errors.name = ['Name is required'];
  if (!email) errors.email = ['Please enter a valid email'];
  if (!subject) errors.subject = ['Subject is required'];
  if (!message) errors.message = ['Message must be at least 10 characters'];

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !toEmail) {
    return { success: false, message: 'Contact form is not configured. Please try again later.' };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'noreply@kqcollective.com.au',
      to: toEmail,
      subject: `Contact form: ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    return { success: true, message: 'Message sent successfully!' };
  } catch {
    return { success: false, message: 'Failed to send message. Please try again.' };
  }
}
