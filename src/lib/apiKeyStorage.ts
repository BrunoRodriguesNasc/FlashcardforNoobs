const KEY = "flashcards_openai_api_key";

/** Stored only in this browser profile (localStorage). Never sent to our servers. */
export function getOpenAIApiKey(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setOpenAIApiKey(value: string): void {
  try {
    if (!value.trim()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value.trim());
  } catch {
    /* quota or private mode */
  }
}

export function clearOpenAIApiKey(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
