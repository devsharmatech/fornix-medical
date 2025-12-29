import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
	try {
		const { user_id, attempt_id, answers, time_taken_seconds } = await req.json();

		if (!user_id || !Array.isArray(answers) || answers.length === 0) {
			return Response.json({ success: false, error: "Invalid payload" }, { status: 400 });
		}

		// Load attempt (if provided) or create new
		let attempt = null;
		if (attempt_id) {
			const { data } = await supabase.from("quiz_attempts").select("*").eq("id", attempt_id).single();
			attempt = data;
			if (!attempt || attempt.user_id !== user_id) {
				return Response.json({ success: false, error: "Attempt not found or not owned by user" }, { status: 404 });
			}
		} else {
			const { data: created } = await supabase
				.from("quiz_attempts")
				.insert({
					user_id,
					total_questions: answers.length,
					started_at: new Date(),
				})
				.select()
				.single();
			attempt = created;
		}

		let correct = 0;
		for (const a of answers) {
			const { data: ca } = await supabase
				.from("correct_answers")
				.select("correct_key")
				.eq("question_id", a.question_id)
				.single();
			const isCorrect = ca?.correct_key === a.selected_key;
			if (isCorrect) correct++;

			await supabase.from("quiz_answers").insert({
				attempt_id: attempt.id,
				question_id: a.question_id,
				selected_key: a.selected_key,
				correct_key: ca?.correct_key,
				is_correct: isCorrect,
			});
		}

		const total = answers.length;
		const score = Math.round((correct / total) * 100);

		await supabase
			.from("quiz_attempts")
			.update({
				correct_answers: correct,
				score,
				time_taken_seconds: time_taken_seconds || null,
				completed_at: new Date(),
			})
			.eq("id", attempt.id);

		// Leaderboard/rank: compute user's rank among attempts in same chapter (if present) else global
		const scopeFilter = attempt.chapter_id ? { column: "chapter_id", value: attempt.chapter_id } : null;

		// Fetch all attempts in scope
		let attemptsQuery = supabase.from("quiz_attempts").select("user_id, score, created_at");
		if (scopeFilter) attemptsQuery = attemptsQuery.eq(scopeFilter.column, scopeFilter.value);
		const { data: scopeAttempts } = await attemptsQuery;

		// Build best-score per user
		const bestByUser = new Map();
		for (const at of scopeAttempts || []) {
			if (typeof at.score !== "number") continue;
			const prev = bestByUser.get(at.user_id);
			if (!prev || at.score > prev.score) {
				bestByUser.set(at.user_id, { user_id: at.user_id, score: at.score });
			}
		}

		const leaderboard = Array.from(bestByUser.values()).sort((a, b) => b.score - a.score);
		const rank = leaderboard.findIndex(x => x.user_id === user_id) + 1 || null;
		const outOf = leaderboard.length;

		return Response.json({
			success: true,
			attempt_id: attempt.id,
			score,
			correct,
			total,
			rank,
			outOf,
		});
	} catch (err) {
		return Response.json({ success: false, error: err.message }, { status: 500 });
	}
}



