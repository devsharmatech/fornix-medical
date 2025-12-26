import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
	try {
		const { user_id, chapter_id = null } = await req.json();
		if (!user_id) {
			return Response.json({ success: false, error: "user_id required" }, { status: 400 });
		}

		// Find attempts to delete (optionally scoped by chapter)
		let attemptsQuery = supabase.from("quiz_attempts").select("id").eq("user_id", user_id);
		if (chapter_id) attemptsQuery = attemptsQuery.eq("chapter_id", chapter_id);
		const { data: attempts } = await attemptsQuery;
		const attemptIds = (attempts || []).map(a => a.id);

		if (attemptIds.length > 0) {
			// Delete quiz_answers for these attempts
			await supabase.from("quiz_answers").delete().in("attempt_id", attemptIds);
			// Delete attempts
			await supabase.from("quiz_attempts").delete().in("id", attemptIds);
		}

		return Response.json({ success: true, deleted_attempts: attemptIds.length });
	} catch (err) {
		return Response.json({ success: false, error: err.message }, { status: 500 });
	}
}


