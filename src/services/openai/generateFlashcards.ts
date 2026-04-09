const CHAT_MODEL = "gpt-4o-mini";

export interface GeneratedCard {
  front: string;
  back: string;
}

export interface GenerateFlashcardsInput {
  topic: string;
  count: number;
}

/**
 * Calls OpenAI Chat Completions from the browser using the user's API key.
 * The key is not persisted by this module; pass it from secure storage.
 */
export async function generateFlashcardsWithOpenAI(
  apiKey: string,
  input: GenerateFlashcardsInput,
): Promise<GeneratedCard[]> {
  const topic = input.topic.trim();
  if (!topic) throw new Error("Topic is empty.");
  const count = Math.min(30, Math.max(1, Math.floor(input.count)));

  const userPrompt = `Create exactly ${count} flashcards for learning English related to this topic:
"""${topic}"""

Rules:
- "front": English word, phrase, or question (short).
- "back": clear explanation or translation of meaning in English (1–3 sentences max).
- Vary difficulty and keep each card atomic.

Return JSON with this exact shape:
{"cards":[{"front":"...","back":"..."}]}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful tutor. Output only valid JSON matching the user schema. No markdown or code fences.",
        },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(
      `OpenAI request failed (${res.status}). ${raw.slice(0, 280)}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Invalid JSON from OpenAI.");
  }

  const content = extractMessageContent(data);
  if (!content) throw new Error("Empty response from OpenAI.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  const cards = extractCards(parsed);
  if (cards.length === 0) throw new Error("No cards in response.");
  return cards.slice(0, count);
}

function extractMessageContent(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const choices = o.choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const msg = choices[0] as Record<string, unknown> | undefined;
  const message = msg?.message as Record<string, unknown> | undefined;
  const c = message?.content;
  return typeof c === "string" ? c : undefined;
}

function extractCards(parsed: unknown): GeneratedCard[] {
  if (!parsed || typeof parsed !== "object") return [];
  const o = parsed as Record<string, unknown>;
  const raw = o.cards;
  if (!Array.isArray(raw)) return [];
  const out: GeneratedCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const front = typeof x.front === "string" ? x.front.trim() : "";
    const back = typeof x.back === "string" ? x.back.trim() : "";
    if (front && back) out.push({ front, back });
  }
  return out;
}
