import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(req, { params }) {
  try {
    ensureAdmin(req);
    const {id} = await params;
    const { data: q, error: qErr } = await supabase.from("questions").select("*").eq("id", id).single();
    if (qErr) throw qErr;
    const { data: options } = await supabase.from("question_options").select("*").eq("question_id", id).order("option_key");
    const { data: correct } = await supabase.from("correct_answers").select("*").eq("question_id", id).single();
    return new Response(JSON.stringify({ success: true, question: q, options, correct: correct || null }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = ensureAdmin(req);
    const {id} = await params;
    const body = await req.json();

    const {
      subject_id, chapter_id, topic_id = null,
      question_text, explanation = null, image_url = null,
      options = [], // full options array to replace
      correct_key
    } = body;

    const updates = { updated_by: admin.sub || admin.id || null, updated_at: new Date().toISOString() };
    if (subject_id) updates.subject_id = subject_id;
    if (chapter_id) updates.chapter_id = chapter_id;
    if (topic_id !== undefined) updates.topic_id = topic_id;
    if (question_text !== undefined) updates.question_text = question_text;
    if (explanation !== undefined) updates.explanation = explanation;
    if (image_url !== undefined) updates.image_url = image_url;

    const { data: updatedQuestion, error: uErr } = await supabase.from("questions").update(updates).eq("id", id).select().single();
    if (uErr) throw uErr;

    // replace options (delete -> insert)
    if (Array.isArray(options) && options.length >= 1) {
      const { error: delOptErr } = await supabase.from("question_options").delete().eq("question_id", id);
      if (delOptErr) throw delOptErr;
      const toInsert = options.map(o => ({
        question_id: id,
        option_key: o.option_key,
        content: o.content,
        created_by: admin.sub || admin.id || null,
        updated_by: admin.sub || admin.id || null,
      }));
      const { error: insOptErr } = await supabase.from("question_options").insert(toInsert);
      if (insOptErr) throw insOptErr;
    }

    // replace correct answer
    if (correct_key) {
      const { error: delCorr } = await supabase.from("correct_answers").delete().eq("question_id", id);
      if (delCorr) throw delCorr;
      if (['a','b','c','d'].includes(correct_key)) {
        const { error: insCorr } = await supabase.from("correct_answers").insert([{
          question_id: id, correct_key,
          created_by: admin.sub || admin.id || null,
          updated_by: admin.sub || admin.id || null,
        }]);
        if (insCorr) throw insCorr;
      }
    }

    return new Response(JSON.stringify({ success: true, question: updatedQuestion }), { status: 200 });
  } catch (err) {
    console.error("questions PUT err:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    ensureAdmin(req);
    const {id} = await params;
    // delete options & corrects first (defensive) then question
    await supabase.from("question_options").delete().eq("question_id", id);
    await supabase.from("correct_answers").delete().eq("question_id", id);
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}
