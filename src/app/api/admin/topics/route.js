import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const admin = ensureAdmin(req);
    const { chapter_id, name, description = "" } = await req.json();
    if (!chapter_id || !name) throw new Error("chapter_id and name required");
    const { data, error } = await supabase.from("topics").insert([{
      chapter_id, name, description,
      created_by: admin.sub || admin.id || null,
      updated_by: admin.sub || admin.id || null,
    }]).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ success: true, topic: data }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}
