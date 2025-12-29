import { ensureAdmin } from "@/lib/verifyToken";
import { ensureQuestionTts, regenerateQuestionTts } from "@/lib/ai";
import { supabase as supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, { params }) {
	try {
		ensureAdmin(req);
		const { id } = await params;
		const { voice, regenerate = false } = await req.json();

		const normalized =
			String(voice || "").toLowerCase() === "female" ? "female" : "male";

		const url = regenerate
			? await regenerateQuestionTts(id, normalized)
			: await ensureQuestionTts(id, normalized);

		return Response.json(
			{
				success: true,
				url,
				voice: normalized,
			},
			{ status: 200 }
		);
	} catch (err) {
		const isQuota =
			err?.code === "INSUFFICIENT_QUOTA" ||
			/INSUFFICIENT_QUOTA|insufficient_quota/i.test(err?.message || "");
		const isNetwork =
			err?.code === "NETWORK_ERROR" ||
			/NETWORK_ERROR|fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(err?.message || "");
		const status = isQuota ? 429 : isNetwork ? 502 : 400;
		return Response.json({ success: false, error: err.message }, { status });
	}
}

export async function DELETE(req, { params }) {
	try {
		ensureAdmin(req);
		const { id } = await params;
		const url = new URL(req.url);
		const voice = url.searchParams.get("voice");
		const normalized = String(voice || "").toLowerCase() === "female" ? "female" : "male";

		// Fetch current URL from DB
		const field =
			normalized === "female" ? "female_explanation_audio_url" : "male_explanation_audio_url";
		const { data: q } = await supabaseAdmin
			.from("questions")
			.select(`id, ${field}`)
			.eq("id", id)
			.single();

		const currentUrl = q?.[field];

		// Remove from storage, if we have a URL
		if (currentUrl) {
			// public URL format: .../storage/v1/object/public/<bucket>/<path>
			const marker = "/storage/v1/object/public/";
			const idx = currentUrl.indexOf(marker);
			if (idx !== -1) {
				const after = currentUrl.substring(idx + marker.length); // "<bucket>/<path>"
				const firstSlash = after.indexOf("/");
				if (firstSlash !== -1) {
					const bucket = after.substring(0, firstSlash);
					const objectPath = after.substring(firstSlash + 1);
					await supabaseAdmin.storage.from(bucket).remove([objectPath]);
				}
			}
		}

		// Clear DB field
		const updatePayload =
			normalized === "female"
				? { female_explanation_audio_url: null }
				: { male_explanation_audio_url: null };
		await supabaseAdmin.from("questions").update(updatePayload).eq("id", id);

		return Response.json({ success: true });
	} catch (err) {
		return Response.json({ success: false, error: err.message }, { status: 400 });
	}
}


