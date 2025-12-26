import { ensureAdmin } from "@/lib/verifyToken";
import { ensureQuestionTts } from "@/lib/ai";

export async function POST(req, { params }) {
	try {
		ensureAdmin(req);
		const { id } = await params;
		const { voice } = await req.json();

		const normalized =
			String(voice || "").toLowerCase() === "female" ? "female" : "male";

		const url = await ensureQuestionTts(id, normalized);

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
		const status = isQuota ? 429 : 400;
		return Response.json({ success: false, error: err.message }, { status });
	}
}


