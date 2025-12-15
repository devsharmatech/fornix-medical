import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { subject_id } = await req.json();

    if (!subject_id) {
      return NextResponse.json(
        { success: false, message: 'subject_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chapters')
      .select('id, name, description')
      .eq('subject_id', subject_id)
      .order('name');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error('Chapters API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
