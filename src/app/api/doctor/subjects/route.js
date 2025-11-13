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
      .insert([
        {
          name,
          description,
          created_by: doctor.sub || doctor.id || null,
          updated_by: doctor.sub || doctor.id || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return new Response(JSON.stringify({ success: true, subject: data }), {
      status: 201,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400 }
    );
  }
}

export async function GET(req) {
  try {
    const doctor = ensureDoctor(req);
    const doctorId = doctor.sub;

    const { data: doctorSubjects, error: assignErr } = await supabase
      .from("doctor_subjects")
      .select("subject_id")
      .eq("doctor_id", doctorId);
    // console.log(doctorId);
    if (assignErr) throw assignErr;
    const assignedSubjectIds = doctorSubjects.map((r) => r.subject_id);

    if (assignedSubjectIds.length === 0) {
      return new Response(JSON.stringify({ success: true, tree: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { data: data, error: subjErr } = await supabase
      .from("subjects")
      .select("*")
      .in("id", assignedSubjectIds)
      .order("name", { ascending: true });
    if (subjErr) throw subjErr;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
      }
    );
  }
}
