import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { chapter_id, easy = 0, moderate = 0, difficult = 0 } = await req.json();

    if (!chapter_id) {
      return NextResponse.json(
        { success: false, message: 'chapter_id required' },
        { status: 400 }
      );
    }

    async function fetchByType(type, limit) {
      if (limit === 0) return [];

      const { data: questions, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_type,
          explanation,
          question_image_url
        `)
        .eq('chapter_id', chapter_id)
        .eq('question_type', type)
        .eq('status', 'approved')
        .limit(limit);

      if (error) throw error;

      // Attach options & correct answer
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

      return questions || [];
    }

    const questions = [
      ...(await fetchByType('easy', easy)),
      ...(await fetchByType('moderate', moderate)),
      ...(await fetchByType('difficult', difficult)),
    ];

    return NextResponse.json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    console.error('Mixed Quiz API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
