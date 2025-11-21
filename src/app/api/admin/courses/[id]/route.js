import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("courses")
    .update({ name: body.name, description: body.description, updated_at: new Date() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(req, { params }) {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true });
}
