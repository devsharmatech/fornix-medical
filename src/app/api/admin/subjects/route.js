import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const admin = ensureAdmin(req);
    const body = await req.json();
    const { name, description = "" } = body;
    if (!name) throw new Error("subject name required");

    const { data, error } = await supabase
      .from("subjects")
      .insert([{
        name,
        description,
        created_by: admin.sub || admin.id || null,
        updated_by: admin.sub || admin.id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify({ success: true, subject: data }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}
