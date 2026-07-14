import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { nisn, tanggal_lahir, sekolah_slug } = await req.json();

    // Validate inputs
    if (!nisn || !/^\d{10}$/.test(nisn)) {
      return Response.json({ error: "NISN harus 10 digit angka" }, { status: 400, headers: corsHeaders });
    }
    if (!tanggal_lahir || !sekolah_slug) {
      return Response.json({ error: "Semua field wajib diisi" }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get sekolah by slug
    const { data: sekolah, error: sekolahErr } = await supabase
      .from("sekolah")
      .select("id, yayasan_id, name")
      .eq("slug", sekolah_slug)
      .eq("is_active", true)
      .single();

    if (sekolahErr || !sekolah) {
      return Response.json({ error: "Kode sekolah tidak ditemukan" }, { status: 404, headers: corsHeaders });
    }

    // Find siswa by NISN in this sekolah
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, nisn, kelas_id, sekolah_id, yayasan_id, is_active, metadata")
      .eq("nisn", nisn)
      .eq("sekolah_id", sekolah.id)
      .eq("role", "SISWA")
      .single();

    if (profileErr || !profile) {
      return Response.json({ error: "NISN tidak terdaftar di sekolah ini" }, { status: 401, headers: corsHeaders });
    }

    if (!profile.is_active) {
      return Response.json({ error: "Akun siswa tidak aktif" }, { status: 403, headers: corsHeaders });
    }

    // Verify tanggal lahir from metadata
    const storedDob: string | undefined = (profile.metadata as Record<string, string>)?.tanggal_lahir;
    if (!storedDob || storedDob !== tanggal_lahir) {
      return Response.json({ error: "NISN atau tanggal lahir tidak cocok" }, { status: 401, headers: corsHeaders });
    }

    // Generate a JWT for this siswa via admin API
    const { data: session, error: sessionErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `${nisn}@siswa.${sekolah_slug}.aruthala.id`,
      options: {
        data: {
          role: "SISWA",
          nisn,
          sekolah_id: sekolah.id,
          yayasan_id: sekolah.yayasan_id,
          kelas_id: profile.kelas_id,
          full_name: profile.full_name,
        },
      },
    });

    if (sessionErr || !session) {
      throw new Error("Gagal membuat sesi login");
    }

    // Log the login
    await supabase.from("audit_logs").insert({
      yayasan_id: sekolah.yayasan_id,
      sekolah_id: sekolah.id,
      actor_id: profile.id,
      actor_role: "SISWA",
      action: "siswa_login",
      resource_type: "profile",
      resource_id: profile.id,
      ip_address: req.headers.get("x-forwarded-for") ?? null,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    return Response.json({
      access_token: session.properties?.action_link,
      user: {
        id: profile.id,
        full_name: profile.full_name,
        nisn: profile.nisn,
        sekolah: sekolah.name,
        kelas_id: profile.kelas_id,
      },
    }, { headers: corsHeaders });

  } catch (err) {
    console.error("[student-login]", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500, headers: corsHeaders });
  }
});
