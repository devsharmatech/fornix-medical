import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("id");
    const newImage = formData.get("profile_picture");

    if (!user_id) return Response.json({ success: false, error: "User ID required" }, { status: 400 });

    const { data: user } = await supabase.from("users").select("*").eq("id", user_id).single();

    let newUrl = user.profile_picture;

    // Upload new image
    if (newImage && newImage.name) {
      // DELETE OLD IMAGE
      if (user.profile_picture) {
        const path = user.profile_picture.split("/storage/v1/object/public/profile/")[1];
        if (path) await supabase.storage.from("profile").remove([path]);
      }

      const ext = newImage.name.split(".").pop();
      const fileName = `user_${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await newImage.arrayBuffer());

      await supabase.storage
        .from("profile")
        .upload(fileName, fileBuffer, { contentType: newImage.type });

      const { data: urlData } = supabase.storage
        .from("profile")
        .getPublicUrl(fileName);

      newUrl = urlData.publicUrl;
    }

    // Update DB
    const { data, error } = await supabase
      .from("users")
      .update({ profile_picture: newUrl, updated_at: new Date() })
      .eq("id", user_id)
      .select()
      .single();

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
