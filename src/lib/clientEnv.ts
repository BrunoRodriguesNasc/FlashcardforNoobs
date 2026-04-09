/**
 * OpenAI key from Vite env (must be prefixed with VITE_ to be available in the browser).
 * Supports VITE_OPENAI_API_KEY or VITE_OPEN_API_KEY.
 */
export function getOpenAiApiKeyFromEnv(): string | undefined {
  const a = import.meta.env.VITE_OPENAI_API_KEY;
  const b = import.meta.env.VITE_OPEN_API_KEY;
  const v = (typeof a === "string" && a.trim() ? a : typeof b === "string" ? b : "")
    .trim();
  return v || undefined;
}
