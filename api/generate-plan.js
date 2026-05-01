import { generatePlan } from "../server/ai-plan-service.mjs";

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const runtime = "nodejs";

export async function OPTIONS() {
  return jsonResponse(204, {});
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim();

    if (!prompt) {
      return jsonResponse(400, { error: "Prompt is required." });
    }

    return jsonResponse(200, await generatePlan(prompt));
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Failed to generate a Vertex AI plan.",
    });
  }
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return OPTIONS();
  }

  if (request.method === "POST") {
    return POST(request);
  }

  return jsonResponse(405, { error: "Method not allowed." });
}
