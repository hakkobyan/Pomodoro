import { getAiHealth } from "../server/ai-plan-service.mjs";

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const runtime = "nodejs";

export async function OPTIONS() {
  return jsonResponse(204, {});
}

export async function GET() {
  return jsonResponse(200, getAiHealth());
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return OPTIONS();
  }

  if (request.method === "GET") {
    return GET();
  }

  return jsonResponse(405, { error: "Method not allowed." });
}
