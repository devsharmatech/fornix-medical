import { ensureDoctor } from "@/lib/verifyToken";
import { ensureQuestionTts } from "@/lib/ai";

export async function POST(req, { params }) {
	try {
		ensureDoctor(req);
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
		const isNetwork =
			err?.code === "NETWORK_ERROR" ||
			/NETWORK_ERROR|fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(err?.message || "");
		const status = isQuota ? 429 : isNetwork ? 502 : 400;
		return Response.json({ success: false, error: err.message }, { status });
	}
}


