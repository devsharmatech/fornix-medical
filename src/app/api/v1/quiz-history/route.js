import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user_id)
      .order('started_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
