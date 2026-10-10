
import { GoogleGenAI } from "@google/genai";

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to backend/.env."
    );
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateAnswer(prompt) {
  const ai = createGeminiClient();

  const model =
    process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const maxOutputTokens = Math.max(
    50,
    Number(process.env.MAX_OUTPUT_TOKENS || 250)
  );

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens
    }
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error(
      "Gemini returned an empty response. Try again."
    );
  }

  const usage = response.usageMetadata || {};

  return {
    answer,
    model: response.modelVersion || model,
    usage: {
      promptTokens: usage.promptTokenCount ?? null,
      outputTokens: usage.candidatesTokenCount ?? null,
      totalTokens: usage.totalTokenCount ?? null
    }
  };
}
