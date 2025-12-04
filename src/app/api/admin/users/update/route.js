import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const { id, full_name, email, phone, role, is_active } = await req.json();

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name,
        email,
        phone,
        role,
        is_active,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return Response.json({ success: false, error: error.message });

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
