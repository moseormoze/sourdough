import type { RecipeFormValues } from "@/lib/validate-recipe";

export interface Recommendation {
  hydration: number;
  salt: number;
  levain: number;
}

type Flour = RecipeFormValues["flour"];

function num(v: number | ""): number {
  return typeof v === "number" ? v : 0;
}

/**
 * Lookup table from design.md §Interaction Specs / Hint logic.
 * Order matters — first matching condition wins.
 */
export function recommendFor(flour: Flour): Recommendation {
  const white = num(flour.white);
  const wholeWheat = num(flour.wholeWheat);
  const rye = num(flour.rye);

  if (white >= 80) {
    return { hydration: 72, salt: 2.0, levain: 20 };
  }
  if (wholeWheat >= 50) {
    return { hydration: 80, salt: 2.2, levain: 22 };
  }
  if (rye >= 30) {
    return { hydration: 78, salt: 2.2, levain: 25 };
  }
  if (white >= 50) {
    return { hydration: 75, salt: 2.0, levain: 20 };
  }
  return { hydration: 75, salt: 2.0, levain: 20 };
}

const DEFAULT_THRESHOLD = 2;

/**
 * Returns the recommended value for a given field if it differs from the
 * current by more than the threshold; otherwise returns null (no hint shown).
 */
export function hintFor(
  field: keyof Recommendation,
  current: number | "",
  flour: Flour,
  threshold: number = DEFAULT_THRESHOLD
): number | null {
  if (current === "") return null;
  const recommended = recommendFor(flour)[field];
  if (Math.abs(current - recommended) <= threshold) return null;
  return recommended;
}
