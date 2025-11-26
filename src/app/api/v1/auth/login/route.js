import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return Response.json(
        { success: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .maybeSingle();

    if (!user) {
      return Response.json(
        { success: false, error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    // ---- Validate password ----
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return Response.json(
        { success: false, error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    // ---- Generate JWT ----
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        phone: user.phone,
        name: user.full_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---- Success ----
    return Response.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: user,
      },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
