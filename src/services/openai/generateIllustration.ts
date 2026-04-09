const IMAGE_MODEL = "dall-e-3";

/**
 * Generates a single illustration (PNG blob) via OpenAI Images API.
 * Uses paid credits; keep prompts short.
 */
export async function generateIllustrationBlob(
  apiKey: string,
  prompt: string,
): Promise<Blob> {
  const p = prompt.trim().slice(0, 900);
  if (!p) throw new Error("Prompt is empty.");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: `Clean, simple educational illustration, no letters or words in the image. ${p}`,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(
      `Image API failed (${res.status}). ${raw.slice(0, 240)}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Invalid JSON from image API.");
  }

  const b64 = extractB64(data);
  if (!b64) throw new Error("No image data returned.");

  return base64ToPngBlob(b64);
}

function extractB64(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const arr = o.data;
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const first = arr[0] as Record<string, unknown>;
  const b = first?.b64_json;
  return typeof b === "string" ? b : undefined;
}

function base64ToPngBlob(b64: string): Blob {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "image/png" });
}
