import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-partner-key",
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validatePartnerKey(supabase: ReturnType<typeof createClient>, apiKey: string) {
  const keyHash = await sha256(apiKey);
  const { data, error } = await supabase
    .from("partner_api_keys")
    .select("id, partner_name, permissions, rate_limit, yayasan_id")
    .eq("api_key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  // Update last_used_at
  await supabase.from("partner_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Validate partner API key
  const partnerKey = req.headers.get("X-Partner-Key") ?? "";
  if (!partnerKey) return Response.json({ error: "PARTNER_KEY_REQUIRED" }, { status: 401, headers: corsHeaders });

  const partner = await validatePartnerKey(supabase, partnerKey);
  if (!partner) return Response.json({ error: "PARTNER_KEY_INVALID" }, { status: 401, headers: corsHeaders });

  const url = new URL(req.url);
  const path = url.pathname.replace("/functions/v1/partner-api", "");

  try {
    // ── POST /sessions — Create exam session ─────────────────
    if (req.method === "POST" && path === "/sessions") {
      const body = await req.json();
      const { reference_id, title, duration_minutes, question_ids, anti_cheat, students, callback_url, valid_until } = body;

      if (!title || !duration_minutes || !question_ids?.length || !students?.length) {
        return Response.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
      }

      // Create exam record
      const { data: exam, error: examErr } = await supabase
        .from("exams")
        .insert({
          title,
          duration_minutes,
          status: "published",
          anti_cheat_config: anti_cheat ?? { fullscreen: true, tab_blur: true },
          yayasan_id: partner.yayasan_id,
          sekolah_id: null, // partner-created exams are cross-school
          created_by: "00000000-0000-0000-0000-000000000000", // system user
          shuffle_questions: true,
          shuffle_options: true,
          end_at: valid_until ?? null,
          metadata: { partner_reference_id: reference_id, callback_url },
        })
        .select("id")
        .single();

      if (examErr || !exam) throw new Error("Failed to create exam");

      // Link questions
      const qLinks = question_ids.map((qid: string, i: number) => ({
        exam_id: exam.id,
        question_id: qid,
        urutan: i + 1,
        bobot: 1.0,
      }));
      await supabase.from("exam_questions").insert(qLinks);

      // Generate student tokens
      const studentTokens = students.map((s: { nisn: string; name: string; reference_id?: string }) => ({
        nisn: s.nisn,
        reference_id: s.reference_id,
        exam_token: crypto.randomUUID(),
        direct_url: `${Deno.env.get("APP_URL") ?? "https://exam.aruthala.id"}/ujian/${exam.id}?nisn=${s.nisn}`,
      }));

      return Response.json({
        session_id: exam.id,
        reference_id,
        exam_url: `${Deno.env.get("APP_URL") ?? "https://exam.aruthala.id"}/ujian/${exam.id}`,
        student_tokens: studentTokens,
        expires_at: valid_until,
      }, { headers: corsHeaders });
    }

    // ── GET /sessions/:id/results ─────────────────────────────
    if (req.method === "GET" && path.match(/^\/sessions\/[^/]+\/results$/)) {
      const examId = path.split("/")[2];

      const { data: sessions, error: sessErr } = await supabase
        .from("exam_sessions")
        .select("id, siswa_id, status, score, max_score, violation_count, submitted_at, siswa:profiles(full_name, nisn, metadata)")
        .eq("exam_id", examId);

      if (sessErr) throw new Error("Failed to fetch results");

      const { data: violations } = await supabase
        .from("exam_violations")
        .select("session_id, violation_type")
        .eq("exam_id", examId);

      const violationsBySession = new Map<string, number>();
      violations?.forEach((v) => {
        violationsBySession.set(v.session_id, (violationsBySession.get(v.session_id) ?? 0) + 1);
      });

      const results = sessions?.map((s) => {
        const siswa = s.siswa as Record<string, unknown>;
        return {
          session_id: s.id,
          nisn: siswa?.nisn,
          reference_id: (siswa?.metadata as Record<string, string>)?.partner_reference_id,
          score: s.score,
          max_score: s.max_score,
          percentage: s.score && s.max_score ? Math.round((s.score / s.max_score) * 1000) / 10 : null,
          status: s.status,
          violation_count: s.violation_count,
          submitted_at: s.submitted_at,
        };
      });

      const flaggedCount = sessions?.filter((s) => s.violation_count >= 5).length ?? 0;
      const totalViolations = violations?.length ?? 0;

      return Response.json({
        exam_id: examId,
        status: "completed",
        results,
        anti_cheat_summary: { total_violations: totalViolations, flagged_students: flaggedCount },
      }, { headers: corsHeaders });
    }

    return Response.json({ error: "ENDPOINT_NOT_FOUND" }, { status: 404, headers: corsHeaders });

  } catch (err) {
    console.error("[partner-api]", err);
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500, headers: corsHeaders });
  }
});
