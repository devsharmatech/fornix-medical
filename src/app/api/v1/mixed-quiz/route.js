import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { chapter_id, easy = 0, moderate = 0, difficult = 0 } = await req.json();

    if (!chapter_id) {
      return NextResponse.json({ success: false, message: 'chapter_id required' }, { status: 400 });
    }

    async function fetchByType(type, limit) {
      if (limit === 0) return [];
      const { data } = await supabase
        .from('questions')
        .select('id, question_text, question_type')
        .eq('chapter_id', chapter_id)
        .eq('question_type', type)
        .eq('status', 'approved')
        .limit(limit);
      return data || [];
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
