import { createServer } from "node:http";
import { generatePlan, getAiHealth } from "./ai-plan-service.mjs";

const PORT = Number(process.env.PORT || 8787);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;

      if (raw.length > 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => resolve(raw));
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL." });
    return;
  }

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "POST" && request.url === "/api/generate-plan") {
    try {
      const rawBody = await readRequestBody(request);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const prompt = String(body?.prompt ?? "").trim();

      if (!prompt) {
        sendJson(response, 400, { error: "Prompt is required." });
        return;
      }

      const result = await generatePlan(prompt);
      sendJson(response, 200, result);
      return;
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Failed to generate a Vertex AI plan.",
      });
      return;
    }
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, getAiHealth());
    return;
  }

  sendJson(response, 404, { error: "Not found." });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vertex AI API listening on http://127.0.0.1:${PORT}`);
});
