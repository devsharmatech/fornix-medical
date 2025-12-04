import { supabase } from "@/lib/supabaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("users").select("*", { count: "exact" });

    if (search) query = query.ilike("full_name", `%${search}%`);

    const { data, count, error } = await query.range(from, to);

    if (error) return Response.json({ success: false, error: error.message });

    return Response.json({
      success: true,
      users: data,
      pagination: {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
