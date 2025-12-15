import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { course_id } = await req.json();

    if (!course_id) {
      return NextResponse.json(
        { success: false, message: 'course_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, description')
      .eq('course_id', course_id)
      .order('name');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error('Subjects API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
