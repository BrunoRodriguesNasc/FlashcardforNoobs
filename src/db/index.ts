import Dexie, { type Table } from "dexie";
import {
  initialSrsState,
  scheduleAfterReview,
  type Grade,
  type SrsState,
} from "../lib/sm2";

export interface Deck {
  id: string;
  name: string;
  createdAt: number;
  /** Accent for library cards (hex), optional for older data. */
  color?: string;
}

export interface CardRow {
  id: string;
  deckId: string;
  front: string;
  back: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number;
  createdAt: number;
  /** Optional image on question side (IndexedDB stores Blob). */
  imageFront?: Blob;
  /** Optional image on answer side. */
  imageBack?: Blob;
}

export interface CardImagePayload {
  imageFront?: Blob | null;
  imageBack?: Blob | null;
}

class FlashcardsDB extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<CardRow, string>;

  constructor() {
    super("english-flashcards");
    this.version(1).stores({
      decks: "id, createdAt",
      cards: "id, deckId, nextReviewAt, createdAt",
    });
    this.version(2).stores({
      decks: "id, createdAt",
      cards: "id, deckId, nextReviewAt, createdAt",
    });
  }
}

export const db = new FlashcardsDB();

export function createDeckId(): string {
  return crypto.randomUUID();
}

export async function addDeck(name: string, color?: string): Promise<Deck> {
  const deck: Deck = {
    id: createDeckId(),
    name: name.trim() || "Untitled deck",
    createdAt: Date.now(),
    ...(color ? { color } : {}),
  };
  await db.decks.add(deck);
  return deck;
}

export async function updateDeck(
  id: string,
  patch: Partial<Pick<Deck, "name" | "color">>,
): Promise<void> {
  await db.decks.update(id, patch);
}

export async function addCard(
  deckId: string,
  front: string,
  back: string,
  images?: CardImagePayload,
): Promise<CardRow> {
  const srs = initialSrsState();
  const now = Date.now();
  const card: CardRow = {
    id: createDeckId(),
    deckId,
    front: front.trim(),
    back: back.trim(),
    easiness: srs.easiness,
    intervalDays: srs.intervalDays,
    repetitions: srs.repetitions,
    nextReviewAt: now,
    createdAt: now,
  };
  if (images?.imageFront) card.imageFront = images.imageFront;
  if (images?.imageBack) card.imageBack = images.imageBack;
  await db.cards.add(card);
  return card;
}

export async function deleteCard(id: string): Promise<void> {
  await db.cards.delete(id);
}

export async function deleteDeck(id: string): Promise<void> {
  await db.cards.where("deckId").equals(id).delete();
  await db.decks.delete(id);
}

export async function applyReview(
  card: CardRow,
  quality: Grade,
): Promise<void> {
  const prev: SrsState = {
    easiness: card.easiness,
    intervalDays: card.intervalDays,
    repetitions: card.repetitions,
  };
  const { state, daysUntilNext } = scheduleAfterReview(prev, quality);
  const next = new Date();
  next.setDate(next.getDate() + daysUntilNext);
  await db.cards.update(card.id, {
    easiness: state.easiness,
    intervalDays: state.intervalDays,
    repetitions: state.repetitions,
    nextReviewAt: next.getTime(),
  });
}

export interface BackupPayloadV1 {
  version: 1;
  exportedAt: number;
  deck: Deck;
  cards: CardRow[];
}

export interface ExportedCardV2 {
  id: string;
  deckId: string;
  front: string;
  back: string;
  easiness: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number;
  createdAt: number;
  imageFront?: { mime: string; b64: string };
  imageBack?: { mime: string; b64: string };
}

export interface BackupPayloadV2 {
  version: 2;
  exportedAt: number;
  deck: Deck;
  cards: ExportedCardV2[];
}

export type BackupPayload = BackupPayloadV1 | BackupPayloadV2;

async function blobToParts(blob: Blob): Promise<{ mime: string; b64: string }> {
  const mime = blob.type || "application/octet-stream";
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);
  return { mime, b64 };
}

function partsToBlob(part: { mime: string; b64: string }): Blob {
  const binary = atob(part.b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: part.mime });
}

export async function buildBackup(
  deck: Deck,
  cards: CardRow[],
): Promise<BackupPayloadV2> {
  const exportedAt = Date.now();
  const out: ExportedCardV2[] = [];
  for (const c of cards) {
    const row: ExportedCardV2 = {
      id: c.id,
      deckId: c.deckId,
      front: c.front,
      back: c.back,
      easiness: c.easiness,
      intervalDays: c.intervalDays,
      repetitions: c.repetitions,
      nextReviewAt: c.nextReviewAt,
      createdAt: c.createdAt,
    };
    if (c.imageFront) {
      row.imageFront = await blobToParts(c.imageFront);
    }
    if (c.imageBack) {
      row.imageBack = await blobToParts(c.imageBack);
    }
    out.push(row);
  }
  return { version: 2, exportedAt, deck, cards: out };
}

export function parseBackupJson(text: string): BackupPayload {
  const data = JSON.parse(text) as unknown;
  if (!data || typeof data !== "object") throw new Error("Invalid backup");
  const o = data as Record<string, unknown>;
  const v = o.version;
  if (v !== 1 && v !== 2) throw new Error("Unsupported backup version");
  if (!o.deck || typeof o.deck !== "object") throw new Error("Invalid deck");
  if (!Array.isArray(o.cards)) throw new Error("Invalid cards");
  return data as BackupPayload;
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (payload.version === 1) {
    await db.transaction("rw", db.decks, db.cards, async () => {
      await db.decks.put(payload.deck);
      for (const c of payload.cards) {
        await db.cards.put(c);
      }
    });
    return;
  }

  await db.transaction("rw", db.decks, db.cards, async () => {
    await db.decks.put(payload.deck);
    for (const ec of payload.cards) {
      const row: CardRow = {
        id: ec.id,
        deckId: ec.deckId,
        front: ec.front,
        back: ec.back,
        easiness: ec.easiness,
        intervalDays: ec.intervalDays,
        repetitions: ec.repetitions,
        nextReviewAt: ec.nextReviewAt,
        createdAt: ec.createdAt,
      };
      if (ec.imageFront) row.imageFront = partsToBlob(ec.imageFront);
      if (ec.imageBack) row.imageBack = partsToBlob(ec.imageBack);
      await db.cards.put(row);
    }
  });
}
