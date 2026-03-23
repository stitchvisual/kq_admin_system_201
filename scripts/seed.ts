/**
 * Unified seed script — runs all seeders in order.
 * Run with: npm run db:seed
 *
 * Requires DATABASE_URL or POSTGRES_URL in .env.local
 */
import * as dotenv from 'dotenv';
import { spawnSync } from 'child_process';
import path from 'path';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL or POSTGRES_URL must be set in .env.local');
  process.exit(1);
}

const scriptsDir = path.resolve(__dirname);
const run = (script: string) => {
  const result = spawnSync('npx', ['tsx', path.join(scriptsDir, script)], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

console.log('Seeding database...\n');

run('seed-ndis-pricing.ts');
console.log('');
run('seed-mock-clients.ts');

console.log('\n✓ All seeds complete.');
