/**
 * Database utilities for ensuring database objects exist
 * These functions provide defensive checks to prevent errors
 * from missing database objects like sequences
 */

import { db } from '@/db';
import { sql } from 'drizzle-orm';

/**
 * Ensures the invoice_number_seq exists and optionally sets its value.
 * This sequence is used to generate sequential invoice numbers.
 * 
 * Usage:
 * - Call this during app initialization or before invoice generation
 * - The START value can be set if you want to continue from an existing invoice number
 * 
 * @param startAt - Optional starting number (default: 1)
 */
export async function ensureInvoiceNumberSequence(startAt = 1): Promise<void> {
  await db.execute(sql`
    CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START ${startAt}
  `);
}

/**
 * Sets the invoice_number_seq to a specific value.
 * Useful when migrating existing invoices and you want to continue numbering.
 * 
 * @param value - The next value to return from nextval()
 */
export async function setInvoiceNumberSequence(value: number): Promise<void> {
  await db.execute(sql`SELECT setval('invoice_number_seq', ${value}, true)`);
}

/**
 * Gets the current value of the invoice_number_seq without incrementing it.
 * Returns null if the sequence doesn't exist.
 */
export async function getInvoiceNumberSequence(): Promise<number | null> {
  try {
    const result = await db.execute(sql`SELECT last_value FROM invoice_number_seq`);
    return result.rows[0]?.last_value || null;
  } catch {
    return null;
  }
}

/**
 * Resets the invoice_number_seq based on the highest existing invoice number.
 * This is useful for data migrations or repairs.
 * 
 * The function extracts the numeric suffix from invoice numbers in format "YYYY-NNN"
 * and sets the sequence to continue from the highest found number.
 */
export async function syncInvoiceNumberSequence(): Promise<void> {
  const result = await db.execute(sql`
    SELECT COALESCE(
      MAX(CAST(substring(invoice_number FROM '-(\d+$)') AS INTEGER)),
      0
    ) as max_number
    FROM invoices
    WHERE invoice_number ~ '\d{4}-\d+'
    AND deleted_at IS NULL
  `);
  
  const maxNumber = result.rows[0]?.max_number || 0;
  
  // Set sequence to max + 1 so next invoice continues correctly
  if (maxNumber > 0) {
    await setInvoiceNumberSequence(maxNumber);
  } else {
    await ensureInvoiceNumberSequence(1);
  }
}

/**
 * Health check for critical database objects.
 * Throws an error with details if any critical objects are missing.
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // Check invoice_number_seq
    const seqResult = await db.execute(sql`
      SELECT 1 FROM pg_sequences WHERE sequencename = 'invoice_number_seq'
    `);
    if (seqResult.rows.length === 0) {
      issues.push('invoice_number_seq sequence is missing');
    }
  } catch (e) {
    issues.push(`Failed to check invoice_number_seq: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  // Add more checks as needed
  // - Check tables exist
  // - Check indexes exist
  // - Check required data exists (e.g., NDIS pricing)
  
  return {
    healthy: issues.length === 0,
    issues,
  };
}
