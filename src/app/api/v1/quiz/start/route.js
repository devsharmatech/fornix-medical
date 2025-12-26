import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
	try {
		const {
			user_id,
			chapter_id = null,
			topic_ids = [],
			limit = 20,
		} = await req.json();

		if (!user_id) {
			return Response.json({ success: false, error: "user_id required" }, { status: 400 });
		}
		if (!chapter_id && (!Array.isArray(topic_ids) || topic_ids.length === 0)) {
			return Response.json({ success: false, error: "Provide chapter_id or topic_ids[]" }, { status: 400 });
		}

		// 1) Candidate questions for scope
		let candidates = [];
		if (chapter_id) {
			const { data, error } = await supabase
				.from("questions")
				.select("id")
				.eq("chapter_id", chapter_id);
				// .eq("status", "approved");
			if (error) throw error;
			candidates = (data || []).map(x => x.id);
		} else if (topic_ids?.length) {
			const { data, error } = await supabase
				.from("questions")
				.select("id, topic_id")
				.in("topic_id", topic_ids);
				// .eq("status", "approved");
			if (error) throw error;
			candidates = (data || []).map(x => x.id);
		}

		// 2) Previously attempted question_ids for user (within scope if chapter)
		let attemptedIds = [];
		{
			let attemptsQuery = supabase
				.from("quiz_attempts")
				.select("id, user_id, chapter_id");

			if (chapter_id) {
				attemptsQuery = attemptsQuery.eq("chapter_id", chapter_id);
			}
			attemptsQuery = attemptsQuery.eq("user_id", user_id);

			const { data: attempts } = await attemptsQuery;
			const attemptIds = (attempts || []).map(a => a.id);

			if (attemptIds.length > 0) {
				const { data: answers } = await supabase
					.from("quiz_answers")
					.select("question_id, attempt_id")
					.in("attempt_id", attemptIds);
				attemptedIds = [...new Set((answers || []).map(a => a.question_id))];
			}
		}

		// 3) Build selection: prefer unattempted, then fill from attempted to reach limit
		const setCandidates = new Set(candidates);
		const setAttempted = new Set(attemptedIds);
		const unattempted = [...setCandidates].filter(id => !setAttempted.has(id));
		const attempted = [...setCandidates].filter(id => setAttempted.has(id));

		// Shuffle helper
		function shuffle(arr) {
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[arr[i], arr[j]] = [arr[j], arr[i]];
			}
			return arr;
		}

		shuffle(unattempted);
		shuffle(attempted);

		const pick = [];
		for (const id of unattempted) {
			if (pick.length >= limit) break;
			pick.push(id);
		}
		for (const id of attempted) {
			if (pick.length >= limit) break;
			if (!pick.includes(id)) pick.push(id);
		}

		// 4) Fetch question payload (without correct answers)
		let questions = [];
		if (pick.length > 0) {
			const { data: qs, error } = await supabase
				.from("questions")
				.select("id, question_text, question_type, question_image_url, explanation")
				.in("id", pick);
			if (error) throw error;

			// Preserve selection order
			const byId = new Map((qs || []).map(q => [q.id, q]));
			questions = pick.map(id => byId.get(id)).filter(Boolean);

			// Attach options only (no correct key)
			for (const q of questions) {
				const { data: options } = await supabase
					.from("question_options")
					.select("option_key, content")
					.eq("question_id", q.id)
					.order("option_key");
				q.options = options || [];
				delete q.explanation; // Optional: avoid leaking explanation
			}
		}

		// 5) Create attempt (started)
		const { data: attempt } = await supabase
			.from("quiz_attempts")
			.insert({
				user_id,
				chapter_id: chapter_id || null,
				total_questions: questions.length,
				started_at: new Date(),
			})
			.select()
			.single();

		return Response.json({
			success: true,
			attempt_id: attempt?.id,
			total: questions.length,
			data: questions,
		});
	} catch (err) {
		return Response.json({ success: false, error: err.message }, { status: 500 });
	}
}


