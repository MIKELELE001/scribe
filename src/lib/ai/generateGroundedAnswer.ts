import Groq from "groq-sdk";
import {
  buildAnswerPrompt,
  type UnlockedSource,
} from "./buildAnswerPrompt";

// Groq model locked by spec (CLAUDE.md §2 / §12).
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Lazily construct the client so a missing key only fails the ask request, not
// module import / build. Server-side only — GROQ_API_KEY is never public.
let client: Groq | null = null;
function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }
  if (!client) client = new Groq({ apiKey });
  return client;
}

/**
 * Generate a grounded answer from the unlocked source material via Groq.
 * Throws if the key is missing or the model returns no content, so the ask
 * route can surface a clean error instead of returning an empty answer.
 */
export async function generateGroundedAnswer(
  question: string,
  sources: UnlockedSource[],
): Promise<string> {
  const messages = buildAnswerPrompt(question, sources);

  const completion = await getClient().chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: 0.2,
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error("The model returned an empty answer.");
  }
  return answer;
}
