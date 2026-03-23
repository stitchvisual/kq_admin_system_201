/**
 * Seed 20 mock clients for testing.
 * Run with: npx tsx scripts/seed-mock-clients.ts
 *
 * Uses upsert — safe to re-run. Existing mock clients are updated.
 * Requires DATABASE_URL or POSTGRES_URL in .env.local
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Sample NDIS rate codes (if they exist in ndis_pricing; optional for clients)
const WEEKDAY_CODE = '01_010_0107_1_1';
const SATURDAY_CODE = '04_105_0125_6_1';
const SUNDAY_CODE = '04_106_0125_6_1';

const MOCK_CLIENTS = [
  { name: 'Alice Mitchell', suburb: 'Melbourne', ndis: '401234567801' },
  { name: 'James Chen', suburb: 'Sydney', ndis: '401234567802' },
  { name: 'Sarah Williams', suburb: 'Brisbane', ndis: '401234567803' },
  { name: 'Michael Brown', suburb: 'Perth', ndis: '401234567804' },
  { name: 'Emma Davis', suburb: 'Adelaide', ndis: '401234567805' },
  { name: 'Oliver Wilson', suburb: 'Hobart', ndis: '401234567806' },
  { name: 'Sophie Taylor', suburb: 'Canberra', ndis: '401234567807' },
  { name: 'Liam Anderson', suburb: 'Darwin', ndis: '401234567808' },
  { name: 'Isabella Martinez', suburb: 'Gold Coast', ndis: '401234567809' },
  { name: 'Noah Thompson', suburb: 'Newcastle', ndis: '401234567810' },
  { name: 'Ava Garcia', suburb: 'Wollongong', ndis: '401234567811' },
  { name: 'Ethan Robinson', suburb: 'Geelong', ndis: '401234567812' },
  { name: 'Mia Clark', suburb: 'Sunshine Coast', ndis: '401234567813' },
  { name: 'Lucas Lewis', suburb: 'Townsville', ndis: '401234567814' },
  { name: 'Charlotte Lee', suburb: 'Cairns', ndis: '401234567815' },
  { name: 'Alexander Hall', suburb: 'Launceston', ndis: '401234567816' },
  { name: 'Amelia Young', suburb: 'Ballarat', ndis: '401234567817' },
  { name: 'Benjamin King', suburb: 'Bendigo', ndis: '401234567818' },
  { name: 'Harper Wright', suburb: 'Toowoomba', ndis: '401234567819' },
  { name: 'Elijah Scott', suburb: 'Alice Springs', ndis: '401234567820' },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL or POSTGRES_URL must be set in .env.local');
    process.exit(1);
  }

  // Dynamic import AFTER dotenv loads so DATABASE_URL is available when db connects
  const { db } = await import('../src/db');
  const { clients } = await import('../src/db/schema/clients');

  console.log('Seeding 20 mock clients...\n');

  for (let i = 0; i < MOCK_CLIENTS.length; i++) {
    const mock = MOCK_CLIENTS[i];
    const num = i + 1;

    const email = `mock.client${num}@test.kqsystem.com`;
    await db
      .insert(clients)
      .values({
        name: mock.name,
        email,
        phone: `04${String(10000000 + num).padStart(8, '0')}`,
        ndis_number: mock.ndis,
        address: `${100 + num} ${mock.suburb} Street`,
        suburb: mock.suburb,
        weekday_code: i % 2 === 0 ? WEEKDAY_CODE : null,
        saturday_code: i % 3 === 0 ? SATURDAY_CODE : null,
        sunday_code: i % 4 === 0 ? SUNDAY_CODE : null,
      })
      .onConflictDoUpdate({
        target: clients.email,
        set: {
          name: mock.name,
          phone: `04${String(10000000 + num).padStart(8, '0')}`,
          ndis_number: mock.ndis,
          address: `${100 + num} ${mock.suburb} Street`,
          suburb: mock.suburb,
          weekday_code: i % 2 === 0 ? WEEKDAY_CODE : null,
          saturday_code: i % 3 === 0 ? SATURDAY_CODE : null,
          sunday_code: i % 4 === 0 ? SUNDAY_CODE : null,
          updated_at: new Date(),
        },
      });

    console.log(`  ✓ ${mock.name} (${email})`);
  }

  console.log(`\nDone! ${MOCK_CLIENTS.length} mock clients created.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
