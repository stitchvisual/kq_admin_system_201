-- Create a sequence for atomic invoice number generation
-- This prevents race conditions when multiple invoices are generated simultaneously
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1;