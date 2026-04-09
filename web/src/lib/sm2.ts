/**
 * SuperMemo SM-2 scheduler (1987).
 * Reference: https://super-memory.com/english/ol/sm2.htm
 */

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrsState {
  easiness: number;
  intervalDays: number;
  repetitions: number;
}

const MIN_EF = 1.3;
const DEFAULT_EF = 2.5;

export function initialSrsState(): SrsState {
  return {
    easiness: DEFAULT_EF,
    intervalDays: 0,
    repetitions: 0,
  };
}

function updateEasiness(ef: number, quality: Grade): number {
  const q = quality;
  const next =
    ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(MIN_EF, next);
}

/**
 * Computes the next SRS state and days until the following review.
 * `quality` is 0–5 per SM-2; values below 3 count as a lapse.
 */
export function scheduleAfterReview(
  state: SrsState,
  quality: Grade,
): { state: SrsState; daysUntilNext: number } {
  if (quality < 3) {
    return {
      state: {
        easiness: state.easiness,
        intervalDays: 1,
        repetitions: 0,
      },
      daysUntilNext: 1,
    };
  }

  const easiness = updateEasiness(state.easiness, quality);
  const repetitions = state.repetitions + 1;

  let intervalDays: number;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.max(
      1,
      Math.round(state.intervalDays * easiness),
    );
  }

  return {
    state: {
      easiness,
      intervalDays,
      repetitions,
    },
    daysUntilNext: intervalDays,
  };
}
