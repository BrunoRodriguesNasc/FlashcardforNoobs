import { addCard, addDeck } from "../db";
import { EXAMPLE_DECK_NAME, EXAMPLE_PAIRS } from "./exampleFlashcards";

/** Inserts a new deck with all sample cards (due immediately). */
export async function loadExampleDeck(): Promise<{ deckId: string }> {
  const deck = await addDeck(EXAMPLE_DECK_NAME);
  for (const [front, back] of EXAMPLE_PAIRS) {
    await addCard(deck.id, front, back);
  }
  return { deckId: deck.id };
}
