-- Add invoiced tracking columns to appointment_participants
ALTER TABLE appointment_participants 
  ADD COLUMN IF NOT EXISTS invoiced boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoice_ref text;

-- Backfill existing data: mark participants as invoiced if their appointment is already invoiced
UPDATE appointment_participants ap
SET invoiced = true, invoice_ref = a.invoice_ref
FROM appointments a
WHERE ap.appointment_id = a.id AND a.invoiced = true;