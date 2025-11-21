import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true, data });
}

export async function POST(req) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("courses")
    .insert([{ name: body.name, description: body.description }])
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true, data });
}
