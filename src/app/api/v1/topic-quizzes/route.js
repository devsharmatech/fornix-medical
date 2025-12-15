import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { topic_ids, question_type, limit = 30 } = await req.json();

    if (!Array.isArray(topic_ids) || topic_ids.length === 0 || !question_type) {
      return NextResponse.json(
        { success: false, message: 'topic_ids and question_type are required' },
        { status: 400 }
      );
    }

    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, question_type, explanation, question_image_url')
      .in('topic_id', topic_ids)
      .eq('question_type', question_type)
    //   .eq('status', 'approved')
      .limit(limit);

    if (error) throw error;

    for (const q of questions || []) {
      const { data: options } = await supabase
        .from('question_options')
        .select('option_key, content')
        .eq('question_id', q.id)
        .order('option_key');

      const { data: correct } = await supabase
        .from('correct_answers')
        .select('correct_key')
        .eq('question_id', q.id)
        .single();

      q.options = options || [];
      q.correct_answer = correct?.correct_key || null;
    }

    return NextResponse.json({
      success: true,
      total: questions?.length || 0,
      data: questions || [],
    });
  } catch (err) {
    console.error('Topic Quiz API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
