import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { user_id, chapter_id, answers, time_taken_seconds } = await req.json();

    if (!user_id || !answers?.length) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Create attempt
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id,
        chapter_id,
        total_questions: answers.length,
        time_taken_seconds,
        completed_at: new Date(),
      })
      .select()
      .single();

    let correct = 0;

    for (const a of answers) {
      const { data: ca } = await supabase
        .from('correct_answers')
        .select('correct_key')
        .eq('question_id', a.question_id)
        .single();

      const isCorrect = ca?.correct_key === a.selected_key;
      if (isCorrect) correct++;

      await supabase.from('quiz_answers').insert({
        attempt_id: attempt.id,
        question_id: a.question_id,
        selected_key: a.selected_key,
        correct_key: ca?.correct_key,
        is_correct: isCorrect,
      });
    }

    const score = Math.round((correct / answers.length) * 100);

    await supabase
      .from('quiz_attempts')
      .update({ correct_answers: correct, score })
      .eq('id', attempt.id);

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: answers.length,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
