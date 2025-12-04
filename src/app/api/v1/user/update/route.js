import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const { id, full_name, phone, gender } = await req.json();

    if (!id) {
      return Response.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name,
        phone,
        gender,
        updated_at: new Date()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return Response.json({ success: false, error: error.message }, { status: 500 });

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
