import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GOOGLE_AI_MODEL || process.env.VERTEX_AI_MODEL || "gemini-2.5-flash";
const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT;
const LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION ||
  process.env.VERTEX_AI_LOCATION ||
  "us-central1";
const API_KEY =
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_AI_API_KEY;

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    sessionName: {
      type: "string",
      description: "A short, clear work session name.",
    },
    tasks: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "A concise, actionable task title.",
          },
        },
        required: ["title"],
      },
    },
    outcome: {
      type: "string",
      description: "A short description of the intended result.",
    },
  },
  required: ["sessionName", "tasks", "outcome"],
};

function buildInstruction(prompt) {
  return [
    "You are creating a focused work session plan for a Pomodoro dashboard.",
    "Return a short session name, 3 to 7 concrete ordered tasks, and a concise outcome.",
    "Make the session name short and clear.",
    "Task titles must be actionable and concise.",
    `User goal: ${prompt}`,
  ].join("\n");
}

function getGenAIClient() {
  if (API_KEY) {
    return new GoogleGenAI({
      apiKey: API_KEY,
      vertexai: true,
    });
  }

  if (!PROJECT_ID) {
    throw new Error(
      "Missing Google Cloud project. Set GOOGLE_CLOUD_PROJECT before using Vertex AI.",
    );
  }

  return new GoogleGenAI({
    vertexai: true,
    project: PROJECT_ID,
    location: LOCATION,
  });
}

export function getAiHealth() {
  const configured = Boolean(API_KEY || PROJECT_ID);

  return {
    ok: configured,
    configured,
    provider: "vertex-ai",
    model: MODEL,
    project: API_KEY ? null : PROJECT_ID ?? null,
    location: API_KEY ? null : LOCATION,
    authMode: API_KEY ? "api-key" : "application-default-credentials",
  };
}

export async function generatePlan(prompt) {
  const normalizedPrompt = String(prompt ?? "").trim();

  if (!normalizedPrompt) {
    throw new Error("Prompt is required.");
  }

  const ai = getGenAIClient();
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: buildInstruction(normalizedPrompt),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: PLAN_SCHEMA,
    },
  });
  const planText = result.text?.trim();

  if (!planText) {
    throw new Error("Vertex AI did not return plan content.");
  }

  try {
    return {
      plan: JSON.parse(planText),
      provider: "vertex-ai",
      model: MODEL,
    };
  } catch {
    throw new Error("Vertex AI returned a plan in an unexpected format.");
  }
}
