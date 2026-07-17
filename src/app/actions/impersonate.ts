"use server";

import { createClient } from "@supabase/supabase-js";

export async function generateImpersonationLink(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: "Kunci SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env.local" };
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Ambil data user auth berdasarkan ID
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user?.email) {
      return { error: "Gagal mengambil email pengguna. (Error: " + (userError?.message || "Tidak ada email") + ")" };
    }

    const email = userData.user.email;

    // Generate Magic Link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError) {
      return { error: "Gagal membuat link sakti (impersonation): " + linkError.message };
    }

    return { link: linkData.properties.action_link };
  } catch (error: any) {
    return { error: "Kesalahan internal di Server Action: " + error.message };
  }
}
