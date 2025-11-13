import { supabase } from "@/lib/supabaseAdmin";
import { ensureDoctor } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const doctor = ensureDoctor(req);
    const body = await req.json();

    const {
      subject_id,
      chapter_id,
      topic_id = null,
      question_text,
      explanation = null,
      image_url = null,
      question_image_url = null,
      options = [], 
      correct_key = null,
    } = body;

    if (!subject_id || !chapter_id || !question_text) throw new Error("subject_id, chapter_id, question_text required");
    if (!Array.isArray(options) || options.length < 2) throw new Error("At least two options required");

    // insert question
    const { data: q, error: qErr } = await supabase.from("questions").insert([{
      subject_id, chapter_id, topic_id, question_text, explanation, image_url,question_image_url,
      created_by: doctor.sub || doctor.id || null,
      updated_by: doctor.sub || doctor.id || null,
    }]).select().single();
    if (qErr) throw qErr;

    // insert options
    const optInsert = options.map(o => ({
      question_id: q.id,
      option_key: o.option_key,
      content: o.content,
      created_by: doctor.sub || doctor.id || null,
      updated_by: doctor.sub || doctor.id || null,
    }));
    const { error: optErr } = await supabase.from("question_options").insert(optInsert);
    if (optErr) {
      // try cleanup
      await supabase.from("questions").delete().eq("id", q.id);
      throw optErr;
    }

    // insert correct answer
    if (correct_key && ['a','b','c','d'].includes(correct_key)) {
      const { error: caErr } = await supabase.from("correct_answers").insert([{
        question_id: q.id, correct_key,
        created_by: doctor.sub || doctor.id || null,
        updated_by: doctor.sub || doctor.id || null,
      }]);
      if (caErr) {
        await supabase.from("question_options").delete().eq("question_id", q.id);
        await supabase.from("questions").delete().eq("id", q.id);
        throw caErr;
      }
    }

    return new Response(JSON.stringify({ success: true, question: q }), { status: 201 });
  } catch (err) {
    console.error("questions POST err:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}
