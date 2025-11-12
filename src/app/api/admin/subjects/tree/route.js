import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(req) {
  try {
    // 🔒 Verify admin
    const admin = ensureAdmin(req);
    const url = new URL(req.url);
    const subjectId = url.searchParams.get("subject_id");
    const chapterId = url.searchParams.get("chapter_id");
    const topicId = url.searchParams.get("topic_id");

    // ✅ Fetch all top-level entities
    const { data: subjects, error: subjErr } = await supabase
      .from("subjects")
      .select("*")
      .order("name", { ascending: true });
    if (subjErr) throw subjErr;

    const { data: chapters, error: chapErr } = await supabase
      .from("chapters")
      .select("*")
      .order("name", { ascending: true });
    if (chapErr) throw chapErr;

    const { data: topics, error: topErr } = await supabase
      .from("topics")
      .select("*")
      .order("name", { ascending: true });
    if (topErr) throw topErr;

    // ✅ Build filter for questions
    let qFilter = {};
    if (topicId) qFilter.topic_id = topicId;
    else if (chapterId) qFilter.chapter_id = chapterId;
    else if (subjectId) qFilter.subject_id = subjectId;

    // ✅ Fetch ALL questions (no pagination)
    const { data: questions, error: qErr } = await supabase
      .from("questions")
      .select("*")
      .match(qFilter)
      .order("created_at", { ascending: false });
    if (qErr) throw qErr;

    // ✅ Fetch options & correct answers for all questions
    const questionIds = questions.map((q) => q.id);
    let options = [];
    let corrects = [];

    if (questionIds.length > 0) {
      const { data: optData, error: optErr } = await supabase
        .from("question_options")
        .select("*")
        .in("question_id", questionIds);
      if (optErr) throw optErr;
      options = optData || [];

      const { data: corrData, error: corrErr } = await supabase
        .from("correct_answers")
        .select("*")
        .in("question_id", questionIds);
      if (corrErr) throw corrErr;
      corrects = corrData || [];
    }

    // ✅ Combine question + options + correct answer
    const questionsWithDetails = questions.map((q) => ({
      ...q,
      options: options
        .filter((opt) => opt.question_id === q.id)
        .sort((a, b) => a.option_key.localeCompare(b.option_key)),
      correct_option:
        corrects.find((c) => c.question_id === q.id)?.correct_key || null,
    }));

    // ✅ Build hierarchical tree
    const tree = subjects.map((subject) => ({
      ...subject,
      chapters: chapters
        .filter((c) => c.subject_id === subject.id)
        .map((chapter) => ({
          ...chapter,
          topics: topics
            .filter((t) => t.chapter_id === chapter.id)
            .map((topic) => ({
              ...topic,
              questions: questionsWithDetails.filter(
                (q) => q.topic_id === topic.id
              ),
            })),
          questions: questionsWithDetails.filter(
            (q) => q.chapter_id === chapter.id && !q.topic_id
          ),
        })),
    }));

    return new Response(
      JSON.stringify({ success: true, tree }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Subjects API error:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
