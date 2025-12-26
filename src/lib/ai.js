import { supabase as supabaseAdmin } from "@/lib/supabaseAdmin";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function ensureEnv() {
	if (!OPENAI_API_KEY) {
		throw new Error("Missing OPENAI_API_KEY");
	}
}

export async function generateExplanationTextIfNeeded(questionId) {
	// Pull existing explanation; if present, return it
	const { data: q, error: qErr } = await supabaseAdmin
		.from("questions")
		.select("id, question_text, explanation")
		.eq("id", questionId)
		.single();
	if (qErr) throw new Error(qErr.message);
	if (q?.explanation && q.explanation.trim().length > 0) {
		return q.explanation;
	}

	// Fetch options and correct answer to compose context
	const [{ data: opts, error: optsErr }, { data: correct, error: corrErr }] =
		await Promise.all([
			supabaseAdmin
				.from("question_options")
				.select("option_key, content")
				.eq("question_id", questionId)
				.order("option_key", { ascending: true }),
			supabaseAdmin
				.from("correct_answers")
				.select("correct_key")
				.eq("question_id", questionId)
				.single(),
		]);
	if (optsErr) throw new Error(optsErr.message);
	if (corrErr) throw new Error(corrErr.message);

	const optionsText = (opts || [])
		.map((o) => `${String(o.option_key).toUpperCase()}. ${o.content}`)
		.join("\n");
	const correctKey = correct?.correct_key?.toUpperCase?.() || "";

	const prompt = [
		{
			role: "system",
			content:
				"You are a medical exam tutor. Explain the reasoning clearly and concisely for the given MCQ. Keep it 60-120 seconds long when read aloud. Use simple language.",
		},
		{
			role: "user",
			content:
				`Question:\n${q.question_text}\n\nOptions:\n${optionsText || "N/A"}\n\nCorrect Answer: ${correctKey}\n\nWrite a concise explanation for why the correct answer is correct and, if useful, why others are not.`,
		},
	];

	let explanation = null;
	// Use OpenAI (npm SDK) for explanation generation
	ensureEnv();
	try {
		const data = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: prompt,
			temperature: 0.4,
		});
		explanation = data?.choices?.[0]?.message?.content?.trim?.() || null;
	} catch {
		// ignore
	}

	if (!explanation) {
		explanation = "Explanation unavailable.";
	}

	// Persist explanation in DB for future reuse
	await supabaseAdmin
		.from("questions")
		.update({ explanation })
		.eq("id", questionId);

	return explanation;
}

export async function synthesizeSpeechToBuffer(text, gender) {
	// Use OpenAI TTS (npm SDK)
	if (!openai) {
		throw new Error("No TTS provider configured");
	}

	// Map simple gender to OpenAI voice names
	const femaleOpenAiEnv =
		process.env.OPENAI_TTS_VOICE_FEMALE; // e.g., coral, shimmer, nova, ballad...
	const maleOpenAiEnv = process.env.OPENAI_TTS_VOICE_MALE; // e.g., alloy
	// Choose a more feminine default for female, while keeping 'alloy' for male
	const voice =
		gender === "female"
			? femaleOpenAiEnv || "coral"
			: maleOpenAiEnv || "alloy";

	try {
		const speech = await openai.audio.speech.create({
			model: "gpt-4o-mini-tts",
			voice,
			input: text,
			format: "mp3",
		});
		// Node: get ArrayBuffer and convert to Buffer
		const arrayBuffer = await speech.arrayBuffer();
		return Buffer.from(arrayBuffer);
	} catch (e) {
		const message = e?.message || "";
		const status = e?.status || e?.response?.status;
		if (status === 429 || /insufficient_quota/i.test(message)) {
			const err = new Error(
				`INSUFFICIENT_QUOTA: ${status || ""} ${message || ""}`.trim()
			);
			err.code = "INSUFFICIENT_QUOTA";
			throw err;
		}
		throw new Error(`OpenAI TTS error: ${status || ""} ${message}`);
	}
}

export async function ensureQuestionTts(questionId, gender) {
	// gender: 'male' | 'female'
	const maleField = "male_explanation_audio_url";
	const femaleField = "female_explanation_audio_url";
	const field = gender === "female" ? femaleField : maleField;

	// Check existing URL
	const { data: q0, error: q0Err } = await supabaseAdmin
		.from("questions")
		.select(`id, ${field}, explanation`)
		.eq("id", questionId)
		.single();
	if (q0Err) throw new Error(q0Err.message);
	if (q0?.[field]) {
		return q0[field];
	}

	// Ensure explanation text
	const explanationText =
		q0?.explanation && q0.explanation.trim().length > 0
			? q0.explanation
			: await generateExplanationTextIfNeeded(questionId);

	// Synthesize TTS
	const audioBuffer = await synthesizeSpeechToBuffer(explanationText, gender);

	// Upload to Supabase storage
	const bucket = "question-explanations";
	const filename = `${questionId}_${gender}.mp3`;
	const { error: upErr } = await supabaseAdmin.storage
		.from(bucket)
		.upload(filename, audioBuffer, {
			contentType: "audio/mpeg",
			upsert: true,
		});
	if (upErr) throw new Error(upErr.message);

	const { data: pub } = supabaseAdmin.storage
		.from(bucket)
		.getPublicUrl(filename);
	const publicUrl = pub?.publicUrl;
	if (!publicUrl) throw new Error("Failed to resolve public URL for audio");

	// Update question row
	const updatePayload =
		gender === "female"
			? { female_explanation_audio_url: publicUrl }
			: { male_explanation_audio_url: publicUrl };
	const { error: updErr } = await supabaseAdmin
		.from("questions")
		.update(updatePayload)
		.eq("id", questionId);
	if (updErr) throw new Error(updErr.message);

	return publicUrl;
}


