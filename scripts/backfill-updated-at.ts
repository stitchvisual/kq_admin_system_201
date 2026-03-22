import { db } from '@/db';
import { invoices } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function backfillUpdatedAt() {
  console.log('Backfilling NULL updated_at values in invoices...');
  
  await db.execute(sql`
    UPDATE invoices 
    SET updated_at = COALESCE(updated_at, created_at)
    WHERE updated_at IS NULL
  `);
  
  console.log('✓ Backfill complete');
  
  const result = await db.execute(sql`
    SELECT COUNT(*) as null_count FROM invoices WHERE updated_at IS NULL
  `);
  
  const nullCount = parseInt(String(result.rows[0]?.null_count) || '0');
  console.log(`Remaining NULL values: ${nullCount}`);
  
  if (nullCount === 0) {
    console.log('✓ All invoices have updated_at values');
  } else {
    console.log('✗ Some invoices still have NULL updated_at');
  }
}

backfillUpdatedAt()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });