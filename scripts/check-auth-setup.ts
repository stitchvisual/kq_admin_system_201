#!/usr/bin/env npx tsx
/**
 * Safe diagnostic script to verify auth setup.
 * Run: npx tsx scripts/check-auth-setup.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const vars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};

function mask(val: string | undefined) {
  if (!val) return '(not set)';
  if (val.length <= 12) return '***';
  return val.slice(0, 8) + '...' + val.slice(-4);
}

console.log('\n--- Auth Setup Check ---\n');

let ok = true;

if (!vars.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  ok = false;
} else {
  console.log('✓ NEXT_PUBLIC_SUPABASE_URL:', vars.NEXT_PUBLIC_SUPABASE_URL);
}

if (!vars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  ok = false;
} else {
  console.log('✓ NEXT_PUBLIC_SUPABASE_ANON_KEY:', mask(vars.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

if (!vars.ADMIN_EMAIL) {
  console.log('❌ ADMIN_EMAIL is not set (required for admin access)');
  ok = false;
} else {
  console.log('✓ ADMIN_EMAIL:', vars.ADMIN_EMAIL);
}

console.log('');
if (ok) {
  console.log('Env vars look OK. Quick checklist:');
  console.log('  • Login URL: /auth');
  console.log('  • Default admin (from create-admin script): admin@kqsystem.com / Admin123!');
  console.log('  • ADMIN_EMAIL must exactly match the email you log in with');
  console.log('');
  console.log('If login form shows an error, that\'s from Supabase (wrong email/password or user doesn\'t exist).');
  console.log('If you reach /admin but API calls fail, ADMIN_EMAIL likely doesn\'t match your user.');
} else {
  console.log('Fix missing env vars in .env.local, then restart the dev server.');
}
console.log('');
