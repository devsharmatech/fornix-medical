import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const { id, full_name, phone, email, gender } = await req.json();

    if (!id) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // EMAIL FORMAT VALIDATION
    // -----------------------------
    if (email) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return Response.json(
          { success: false, error: "Invalid email format" },
          { status: 422 }
        );
      }
    }

    // -----------------------------
    // EMAIL DUPLICATE CHECK
    // -----------------------------
    if (email) {
      const { data: emailExists } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", id) // ignore same user
        .maybeSingle();

      if (emailExists) {
        return Response.json(
          { success: false, error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // -----------------------------
    // PHONE DUPLICATE CHECK
    // -----------------------------
    if (phone) {
      const { data: phoneExists } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .neq("id", id) // ignore same user
        .maybeSingle();

      if (phoneExists) {
        return Response.json(
          { success: false, error: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name,
        phone,
        email,
        gender,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
