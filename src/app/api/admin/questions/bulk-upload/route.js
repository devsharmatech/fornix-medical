import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const admin = ensureAdmin(req);
    const body = await req.json();
    const rows = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0)
      throw new Error("No rows received");

    let imported = 0;

    const subjectCache = new Map();
    const chapterCache = new Map();
    const topicCache = new Map();

    async function getOrCreateSubject(name) {
      if (!name) return null;
      const key = name.toLowerCase();
      if (subjectCache.has(key)) return subjectCache.get(key);

      const { data: existing } = await supabase
        .from("subjects")
        .select("id")
        .ilike("name", name)
        .maybeSingle();

      if (existing) {
        subjectCache.set(key, existing.id);
        return existing.id;
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert([{ name, created_by: admin.sub, updated_by: admin.sub }])
        .select("id")
        .single();
      if (error) throw error;
      subjectCache.set(key, data.id);
      return data.id;
    }

    async function getOrCreateChapter(subjectId, chapterName) {
      if (!subjectId || !chapterName) return null;
      const key = `${subjectId}-${chapterName.toLowerCase()}`;
      if (chapterCache.has(key)) return chapterCache.get(key);

      const { data: existing } = await supabase
        .from("chapters")
        .select("id")
        .eq("subject_id", subjectId)
        .ilike("name", chapterName)
        .maybeSingle();

      if (existing) {
        chapterCache.set(key, existing.id);
        return existing.id;
      }

      const { data, error } = await supabase
        .from("chapters")
        .insert([{ subject_id: subjectId, name: chapterName, created_by: admin.sub, updated_by: admin.sub }])
        .select("id")
        .single();
      if (error) throw error;
      chapterCache.set(key, data.id);
      return data.id;
    }

    async function getOrCreateTopic(chapterId, topicName) {
      if (!topicName) return null;
      const key = `${chapterId}-${topicName.toLowerCase()}`;
      if (topicCache.has(key)) return topicCache.get(key);

      const { data: existing } = await supabase
        .from("topics")
        .select("id")
        .eq("chapter_id", chapterId)
        .ilike("name", topicName)
        .maybeSingle();

      if (existing) {
        topicCache.set(key, existing.id);
        return existing.id;
      }

      const { data, error } = await supabase
        .from("topics")
        .insert([{ chapter_id: chapterId, name: topicName, created_by: admin.sub, updated_by: admin.sub }])
        .select("id")
        .single();
      if (error) throw error;
      topicCache.set(key, data.id);
      return data.id;
    }

    for (const raw of rows) {
      // skip question_no column if present
      const {
        question_no,
        subject,
        chapter,
        topic,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation,
        image_url,
      } = raw;

      if (!subject || !chapter || !question_text) continue;
      const correct = (correct_option || "").toLowerCase();
      if (!["a", "b", "c", "d"].includes(correct)) continue;

      const subjectId = await getOrCreateSubject(subject);
      const chapterId = await getOrCreateChapter(subjectId, chapter);
      const topicId = topic ? await getOrCreateTopic(chapterId, topic) : null;

      const { data: q, error: qErr } = await supabase
        .from("questions")
        .insert([
          {
            subject_id: subjectId,
            chapter_id: chapterId,
            topic_id: topicId,
            question_text,
            explanation: explanation || null,
            image_url: image_url || null,
            created_by: admin.sub,
            updated_by: admin.sub,
          },
        ])
        .select("id")
        .single();

      if (qErr) {
        console.error(qErr);
        continue;
      }

      const options = [
        { key: "a", text: option_a },
        { key: "b", text: option_b },
        { key: "c", text: option_c },
        { key: "d", text: option_d },
      ].filter((x) => x.text);

      await supabase.from("question_options").insert(
        options.map((o) => ({
          question_id: q.id,
          option_key: o.key,
          content: o.text,
          created_by: admin.sub,
          updated_by: admin.sub,
        }))
      );

      await supabase.from("correct_answers").insert([
        {
          question_id: q.id,
          correct_key: correct,
          created_by: admin.sub,
          updated_by: admin.sub,
        },
      ]);

      imported++;
    }

    return new Response(JSON.stringify({ success: true, imported }), { status: 200 });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
