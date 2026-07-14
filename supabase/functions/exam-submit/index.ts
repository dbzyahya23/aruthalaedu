import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) return Response.json({ error: "Invalid token" }, { status: 401, headers: corsHeaders });

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: "session_id required" }, { status: 400, headers: corsHeaders });

    // Verify session belongs to this user
    const { data: session, error: sessErr } = await supabase
      .from("exam_sessions")
      .select("*, exam:exams(*)")
      .eq("id", session_id)
      .eq("siswa_id", user.id)
      .single();

    if (sessErr || !session) return Response.json({ error: "Sesi tidak ditemukan" }, { status: 404, headers: corsHeaders });
    if (session.status === "submitted" || session.status === "graded") {
      return Response.json({ error: "Ujian sudah dikumpulkan" }, { status: 409, headers: corsHeaders });
    }

    const exam = session.exam as Record<string, unknown>;

    // Fetch all answers for this session
    const { data: answers, error: answersErr } = await supabase
      .from("exam_answers")
      .select("question_id, answer")
      .eq("session_id", session_id);

    if (answersErr) throw new Error("Gagal mengambil jawaban");

    // Fetch correct answers from exam_questions + questions
    const { data: examQuestions, error: eqErr } = await supabase
      .from("exam_questions")
      .select("question_id, bobot, question:questions(type, content)")
      .eq("exam_id", session.exam_id);

    if (eqErr || !examQuestions) throw new Error("Gagal mengambil soal");

    // Score calculation (server-side — answers key never sent to client)
    const answersMap = new Map(answers?.map((a) => [a.question_id, a.answer]) ?? []);
    let totalScore = 0;
    let maxScore = 0;
    const scoreDetails: Record<string, unknown>[] = [];

    for (const eq of examQuestions) {
      const q = eq.question as Record<string, unknown>;
      const content = q.content as Record<string, unknown>;
      const bobot = eq.bobot as number;
      const studentAnswer = answersMap.get(eq.question_id);
      maxScore += bobot;

      let isCorrect = false;
      let questionScore = 0;

      if (q.type === "multiple_choice") {
        const options = content.options as { id: string; text: string; is_correct: boolean }[];
        const correctOpt = options?.find((o) => o.is_correct);
        if (correctOpt && studentAnswer?.selected === correctOpt.id) {
          isCorrect = true;
          questionScore = bobot;
        }
      } else if (q.type === "true_false") {
        const correctAnswer = content.correct_answer as boolean;
        if (studentAnswer?.selected === correctAnswer) {
          isCorrect = true;
          questionScore = bobot;
        }
      } else if (q.type === "fill_blank") {
        const correct = (content.correct_answer as string)?.toLowerCase().trim();
        const given = (studentAnswer?.text as string)?.toLowerCase().trim();
        if (correct && given && (correct === given || given.includes(correct))) {
          isCorrect = true;
          questionScore = bobot;
        }
      } else if (q.type === "essay") {
        isCorrect = null as unknown as boolean; // Needs manual grading
        questionScore = 0;
      }

      totalScore += questionScore;
      scoreDetails.push({ question_id: eq.question_id, is_correct: isCorrect, score: questionScore, bobot });

      // Update answer record with scoring result
      if (q.type !== "essay" && studentAnswer !== undefined) {
        await supabase.from("exam_answers")
          .update({ is_correct: isCorrect, score: questionScore })
          .eq("session_id", session_id)
          .eq("question_id", eq.question_id);
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passingScore = (exam.passing_score as number) ?? 70;
    const timeSpent = session.started_at
      ? Math.floor((Date.now() - new Date(session.started_at as string).getTime()) / 1000)
      : 0;

    // Update session as submitted
    await supabase.from("exam_sessions").update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      score: totalScore,
      max_score: maxScore,
      score_details: scoreDetails,
      time_remaining: Math.max(0, (exam.duration_minutes as number) * 60 - timeSpent),
    }).eq("id", session_id);

    // Audit log
    await supabase.from("audit_logs").insert({
      yayasan_id: session.yayasan_id,
      sekolah_id: session.sekolah_id,
      actor_id: user.id,
      actor_role: "SISWA",
      action: "exam_submitted",
      resource_type: "exam_session",
      resource_id: session_id,
      metadata: { score: totalScore, max_score: maxScore, percentage },
    });

    return Response.json({
      session_id,
      score: totalScore,
      max_score: maxScore,
      percentage: Math.round(percentage * 10) / 10,
      is_passed: percentage >= passingScore,
      time_spent_seconds: timeSpent,
      show_answers: exam.show_result_after === "submit",
    }, { headers: corsHeaders });

  } catch (err) {
    console.error("[exam-submit]", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500, headers: corsHeaders });
  }
});
