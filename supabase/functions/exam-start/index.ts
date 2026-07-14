import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT and get user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) return Response.json({ error: "Invalid token" }, { status: 401, headers: corsHeaders });

    const { exam_id, token } = await req.json();
    if (!exam_id && !token) return Response.json({ error: "exam_id or token required" }, { status: 400, headers: corsHeaders });

    // Get exam
    const examQuery = exam_id
      ? supabase.from("exams").select("*").eq("id", exam_id).single()
      : supabase.from("exams").select("*").eq("id", token).single(); // token = exam_id in simplified flow

    const { data: exam, error: examErr } = await examQuery;
    if (examErr || !exam) return Response.json({ error: "Ujian tidak ditemukan" }, { status: 404, headers: corsHeaders });
    if (exam.status !== "published") return Response.json({ error: "Ujian belum dibuka" }, { status: 403, headers: corsHeaders });

    // Check time window
    const now = new Date();
    if (exam.start_at && new Date(exam.start_at) > now) {
      return Response.json({ error: `Ujian dimulai pada ${exam.start_at}` }, { status: 403, headers: corsHeaders });
    }
    if (exam.end_at && new Date(exam.end_at) < now) {
      return Response.json({ error: "Waktu ujian sudah habis" }, { status: 403, headers: corsHeaders });
    }

    // Check attempt count
    const { count } = await supabase
      .from("exam_sessions")
      .select("*", { count: "exact", head: true })
      .eq("exam_id", exam.id)
      .eq("siswa_id", user.id)
      .neq("status", "not_started");

    if ((count ?? 0) >= exam.max_attempts) {
      return Response.json({ error: "Sudah mencapai batas percobaan" }, { status: 403, headers: corsHeaders });
    }

    // Fetch questions — 1x hit DB (JSON bulk download)
    const { data: examQuestions, error: eqErr } = await supabase
      .from("exam_questions")
      .select("urutan, bobot, question:questions(id, type, content, mata_pelajaran)")
      .eq("exam_id", exam.id)
      .order("urutan");

    if (eqErr || !examQuestions?.length) {
      return Response.json({ error: "Soal tidak ditemukan" }, { status: 404, headers: corsHeaders });
    }

    // Shuffle questions if configured
    const questionList = exam.shuffle_questions
      ? shuffle(examQuestions)
      : examQuestions;

    // Build question order (for session record)
    const questionOrder = questionList.map((eq) => {
      const q = eq.question as Record<string, unknown>;
      const opts = (q.content as Record<string, unknown>)?.options as { id: string }[] | undefined;
      return {
        question_id: q.id,
        options_order: opts && exam.shuffle_options ? shuffle(opts.map((o) => o.id)) : opts?.map((o) => o.id),
      };
    });

    // Create session
    const { data: session, error: sessionErr } = await supabase
      .from("exam_sessions")
      .insert({
        exam_id: exam.id,
        siswa_id: user.id,
        sekolah_id: exam.sekolah_id,
        yayasan_id: exam.yayasan_id,
        attempt_number: (count ?? 0) + 1,
        question_order: questionOrder,
        status: "in_progress",
        started_at: new Date().toISOString(),
        time_remaining: exam.duration_minutes * 60,
        ip_address: req.headers.get("x-forwarded-for") ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
      })
      .select("id")
      .single();

    if (sessionErr || !session) throw new Error("Gagal membuat sesi ujian");

    // Build response — CRITICAL: never send is_correct or correct_answer
    const questionsForClient = questionList.map((eq, idx) => {
      const q = eq.question as Record<string, unknown>;
      const content = q.content as Record<string, unknown>;
      const orderItem = questionOrder[idx];

      const safeOptions = orderItem.options_order?.map((optId: string) => {
        const original = (content.options as { id: string; text: string; is_correct: boolean }[])
          .find((o) => o.id === optId);
        return { id: optId, text: original?.text ?? "" };
        // is_correct is NEVER included
      });

      return {
        id: q.id,
        type: q.type,
        content: {
          text: content.text,
          media_url: content.media_url,
          ...(q.type === "multiple_choice" && { options: safeOptions }),
          // correct_answer is NEVER included for any type
        },
      };
    });

    // Audit log
    await supabase.from("audit_logs").insert({
      yayasan_id: exam.yayasan_id,
      sekolah_id: exam.sekolah_id,
      actor_id: user.id,
      actor_role: "SISWA",
      action: "exam_started",
      resource_type: "exam",
      resource_id: exam.id,
      metadata: { session_id: session.id },
    });

    return Response.json({
      session_id: session.id,
      exam_title: exam.title,
      total_questions: questionsForClient.length,
      duration_seconds: exam.duration_minutes * 60,
      anti_cheat_config: exam.anti_cheat_config,
      questions: questionsForClient, // Full JSON bulk — no more DB hits needed
    }, { headers: corsHeaders });

  } catch (err) {
    console.error("[exam-start]", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500, headers: corsHeaders });
  }
});
