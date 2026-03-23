-- Resend Email Tracking for Invoices
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query) before deploying code changes.

ALTER TABLE invoices
  ADD COLUMN emailed_at TIMESTAMPTZ,
  ADD COLUMN resend_email_id TEXT;
