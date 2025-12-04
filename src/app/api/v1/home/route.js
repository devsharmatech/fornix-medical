import { supabase } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Fetch all active banners
    const { data: banners, error: bannerError } = await supabase
      .from("banners")
      .select("*")
      .eq("status", true)
      .order("created_at", { ascending: false });

    if (bannerError) {
      return Response.json(
        { success: false, error: bannerError.message },
        { status: 500 }
      );
    }

    // Fetch all active testimonials
    const { data: testimonials, error: testimonialError } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", true)
      .order("created_at", { ascending: false });

    if (testimonialError) {
      return Response.json(
        { success: false, error: testimonialError.message },
        { status: 500 }
      );
    }

    // Final response
    return Response.json({
      success: true,
      banners,
      testimonials,
    });

  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
