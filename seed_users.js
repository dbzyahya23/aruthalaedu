const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUsers() {
  console.log("Seeding users...");

  // Owner / Super Admin
  const { data: owner, error: ownerError } = await supabase.auth.admin.createUser({
    email: 'AruthalaEDU',
    password: 'Aruthala@123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Owner',
      role: 'SUPER_ADMIN'
    }
  });

  if (ownerError) {
    if (ownerError.message.includes('already registered')) {
       console.log("Owner already exists.");
    } else {
       console.error("Error creating Owner:", ownerError.message);
    }
  } else {
    console.log("Created Owner:", owner.user.id);
  }

  // Super Admin
  const { data: superAdmin, error: saError } = await supabase.auth.admin.createUser({
    email: 'superadmin@aruthala.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });
  const { data: guru, error: gError } = await supabase.auth.admin.createUser({
    email: 'guru@annur.sch.id',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Guru An-Nur',
      role: 'GURU'
    }
  });

  if (gError) {
    if (gError.message.includes('already registered')) {
       console.log("Guru already exists.");
    } else {
       console.error("Error creating Guru:", gError.message);
    }
  } else {
    console.log("Created Guru:", guru.user.id);
  }

  console.log("Done.");
}

seedUsers();
