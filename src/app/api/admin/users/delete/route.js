import { supabase } from "@/lib/supabaseAdmin";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    const { data: user } = await supabase.from("users").select("*").eq("id", id).single();

    if (user.profile_picture) {
      const path = user.profile_picture.split("/storage/v1/object/public/profile/")[1];
      if (path) await supabase.storage.from("profile").remove([path]);
    }

    await supabase.from("users").delete().eq("id", id);

    return Response.json({ success: true, message: "User deleted" });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
