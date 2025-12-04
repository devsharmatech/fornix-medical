import { supabase } from "@/lib/supabaseAdmin";

export async function DELETE(req) {
  try {
    let id;

    // Ensure request contains JSON (Next.js DELETE sometimes needs manual parsing)
    try {
      const body = await req.json();
      id = body.id;
    } catch {
      return Response.json(
        { success: false, error: "Invalid JSON data" },
        { status: 400 }
      );
    }

    if (!id) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // ---------------------------
    // GET USER
    // ---------------------------
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle(); // prevents crash when null

    if (userError) {
      return Response.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // ---------------------------
    // DELETE PROFILE IMAGE SAFELY
    // ---------------------------
    if (user.profile_picture) {
      const path = user.profile_picture.split(
        "/storage/v1/object/public/profile/"
      )[1];

      if (path) {
        const { error: removeErr } = await supabase.storage
          .from("profile")
          .remove([path]);

        if (removeErr) {
          console.log("Failed deleting image:", removeErr.message);
        }
      }
    }

    // ---------------------------
    // DELETE USER
    // ---------------------------
    const { error: deleteErr } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return Response.json(
        { success: false, error: deleteErr.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
