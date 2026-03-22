/**
 * Seed NDIS pricing tiers.
 * Run with: npx tsx scripts/seed-ndis-pricing.ts
 *
 * Uses upsert - safe to re-run to update prices.
 * Requires DATABASE_URL or POSTGRES_URL in .env.local
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Data: Category, Support Item Code, Support Item Name, Unit, National, Remote, Very Remote
// "-" = null
const PRICING_ROWS = [
  { category: 'Provider Travel', code: '04_799_0104_6_1', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Provider Travel', code: '04_799_0125_6_1', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Provider Travel', code: '04_799_0133_5_1', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Provider Travel', code: '04_799_0136_6_1', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Provider Travel', code: '09_799_0106_6_3', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Provider Travel', code: '09_799_0117_6_3', name: 'Provider travel - non-labour costs', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '04_590_0125_6_1', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '04_591_0136_6_1', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '04_592_0104_6_1', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '04_821_0133_6_1', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '09_590_0106_6_3', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Transport', code: '09_591_0117_6_3', name: 'Activity Based Transport', unit: 'Each', national: 1.00, remote: null, veryRemote: null },
  { category: 'Core Support', code: '01_010_0107_1_1', name: 'Assistance with Self-Care Activities - Night-Time Sleepover', unit: 'Each', national: 297.60, remote: 416.64, veryRemote: 446.40 },
  { category: 'Core Support', code: '04_104_0125_6_1', name: 'Access Community Social and Rec Activ - Weekday Daytime', unit: 'Hour', national: 70.23, remote: 98.32, veryRemote: 105.35 },
  { category: 'Core Support', code: '04_105_0125_6_1', name: 'Access Community Social and Rec Activ - Saturday', unit: 'Hour', national: 98.83, remote: 138.36, veryRemote: 148.25 },
  { category: 'Core Support', code: '04_106_0125_6_1', name: 'Access Community Social and Rec Activ - Sunday', unit: 'Hour', national: 127.43, remote: 178.40, veryRemote: 191.15 },
  { category: 'Capacity Building', code: '09_009_0117_6_3', name: 'Skills Development and Training', unit: 'Hour', national: 80.06, remote: 112.08, veryRemote: 120.09 },
  { category: 'Capacity Building', code: '09_008_0116_6_3', name: 'Innovative Community Participation', unit: 'Each', national: null, remote: null, veryRemote: null },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL or POSTGRES_URL must be set in .env.local');
    process.exit(1);
  }

  const { db } = await import('../src/db');
  const { ndisPricing } = await import('../src/db/schema/ndis_pricing');

  console.log('Seeding NDIS pricing tiers...\n');

  for (const row of PRICING_ROWS) {
    await db
      .insert(ndisPricing)
      .values({
        category: row.category,
        support_item_code: row.code,
        support_item_name: row.name,
        unit: row.unit,
        national_price: row.national?.toString() ?? null,
        remote_price: row.remote?.toString() ?? null,
        very_remote_price: row.veryRemote?.toString() ?? null,
      })
      .onConflictDoUpdate({
        target: ndisPricing.support_item_code,
        set: {
          category: row.category,
          support_item_name: row.name,
          unit: row.unit,
          national_price: row.national?.toString() ?? null,
          remote_price: row.remote?.toString() ?? null,
          very_remote_price: row.veryRemote?.toString() ?? null,
        },
      });

    const priceStr = row.national != null ? `$${row.national}` : '-';
    console.log(`  ✓ ${row.code} — ${row.name} (${priceStr}/${row.unit})`);
  }

  console.log(`\nDone! ${PRICING_ROWS.length} NDIS pricing tiers seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
