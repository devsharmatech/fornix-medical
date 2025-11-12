import { supabase } from "@/lib/supabaseAdmin";
import { ensureDoctor } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    const doctor = ensureDoctor(req);
    const body = await req.json();
    const { name, description = "" } = body;
    if (!name) throw new Error("subject name required");

    const { data, error } = await supabase
      .from("subjects")
      .insert([{
        name,
        description,
        created_by: doctor.sub || doctor.id || null,
        updated_by: doctor.sub || doctor.id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify({ success: true, subject: data }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400 });
  }
}
