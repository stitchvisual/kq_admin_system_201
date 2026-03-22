import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function createAdminUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@kqsystem.com',
    password: 'Admin123!',
    email_confirm: true,
    user_metadata: {
      role: 'admin',
    },
  });

  if (error) {
    console.error('Error creating admin user:', error);
  } else {
    console.log('Admin user created:', data.user);
  }
}

createAdminUser();
