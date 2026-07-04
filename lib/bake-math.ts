import { DEFAULT_FEED_RATIO, type FeedRatio } from "./bake-timing";
import type { Flour, Recipe } from "./types/recipe";

export type FlourType = keyof Flour;

/** Flour types shown in the levain/mix breakdown. `other` is last: never
 * authored since spelt landed, but legacy saved recipes may still carry it —
 * it gets its own labeled entry rather than being folded into another type. */
const FLOUR_TYPES_ORDER = ["white", "wholeWheat", "rye", "speltWhite", "speltWhole", "other"] as const;
export type DisplayFlourType = (typeof FLOUR_TYPES_ORDER)[number];

export interface FlourBreakdownEntry {
  type: DisplayFlourType;
  grams: number;
}

export interface BakeQuantities {
  totalFlourGrams: number;
  totalWaterGrams: number;
  saltGrams: number;
  levainTotalGrams: number;
  levainBuild: {
    starterGrams: number;
    waterGrams: number;
    flourGrams: number;
    flourBreakdown: FlourBreakdownEntry[];
  };
  mixAdditions: {
    flourGrams: number;
    flourBreakdown: FlourBreakdownEntry[];
    waterGrams: number;
    saltReserveWaterGrams: number;
  };
}

// The salt-dissolving reserve: ~5% of total water in friendly 5g steps,
// never below 15g (enough to dissolve the salt) or above 50g (still pourable
// in one go). The canonical 500g/75% recipe keeps its familiar 20g.
const SALT_RESERVE_MIN_GRAMS = 15;
const SALT_RESERVE_MAX_GRAMS = 50;

function saltReserveWaterFor(totalWaterGrams: number, waterAvailableGrams: number): number {
  const base = Math.round((totalWaterGrams * 0.05) / 5) * 5;
  const clamped = Math.min(SALT_RESERVE_MAX_GRAMS, Math.max(SALT_RESERVE_MIN_GRAMS, base));
  return Math.max(0, Math.min(clamped, waterAvailableGrams));
}

/** Largest-remainder apportionment: integer grams per type, non-negative,
 * summing exactly to totalGrams. Zero-gram entries are dropped only AFTER
 * the apportionment, so rounding can never produce a negative or an empty
 * list for a positive total. */
function breakdownByBlend(totalGrams: number, blend: Flour): FlourBreakdownEntry[] {
  if (totalGrams <= 0) return [];

  const shares = FLOUR_TYPES_ORDER.map((type) => {
    const exact = (totalGrams * (blend[type] ?? 0)) / 100;
    return { type, grams: Math.floor(exact), rem: exact - Math.floor(exact) };
  });

  let deficit = totalGrams - shares.reduce((acc, s) => acc + s.grams, 0);
  const byRemainder = [...shares].sort((a, b) => b.rem - a.rem);
  for (let i = 0; deficit > 0; i = (i + 1) % byRemainder.length, deficit--) {
    byRemainder[i]!.grams += 1;
  }

  return shares
    .filter((s) => s.grams > 0)
    .map(({ type, grams }) => ({ type, grams }));
}

export interface RefreshBreakdown {
  starterGrams: number;
  flourGrams: number;
  waterGrams: number;
}

/**
 * How much mother starter / flour / water to feed, given the desired total amount
 * of active starter and the chosen feed ratio (1:N:N, 100% hydration).
 * The total sums exactly (rounding drift absorbed by flour).
 */
export function computeRefreshBreakdown(totalGrams: number, ratio: FeedRatio = DEFAULT_FEED_RATIO): RefreshBreakdown {
  const parts = 1 + ratio + ratio; // 1 starter + N flour + N water
  const starterGrams = Math.round(totalGrams / parts);
  const waterGrams = Math.round((totalGrams * ratio) / parts);
  // absorb rounding drift into flour so the three values sum exactly
  const flourGrams = totalGrams - starterGrams - waterGrams;
  return { starterGrams, flourGrams, waterGrams };
}

export function computeBakeQuantities(recipe: Recipe, feedRatio: FeedRatio = DEFAULT_FEED_RATIO): BakeQuantities {
  const totalFlourGrams = recipe.flourWeightGrams;
  const totalWaterGrams = Math.round((recipe.flourWeightGrams * recipe.hydration) / 100);
  const saltGrams = Math.round((recipe.flourWeightGrams * recipe.salt) / 100);
  const levainTotalGrams = Math.round((recipe.flourWeightGrams * recipe.levain) / 100);

  const { starterGrams: levainStarter, flourGrams: levainFlour, waterGrams: levainWater } =
    computeRefreshBreakdown(levainTotalGrams, feedRatio);

  const mixFlour = Math.round(totalFlourGrams - levainFlour - levainStarter / 2);
  const waterAfterLevain = Math.round(totalWaterGrams - levainWater - levainStarter / 2);
  const saltReserveWaterGrams = saltReserveWaterFor(totalWaterGrams, waterAfterLevain);
  const mixWater = waterAfterLevain - saltReserveWaterGrams;

  return {
    totalFlourGrams,
    totalWaterGrams,
    saltGrams,
    levainTotalGrams,
    levainBuild: {
      starterGrams: levainStarter,
      waterGrams: levainWater,
      flourGrams: levainFlour,
      flourBreakdown: breakdownByBlend(levainFlour, recipe.flour),
    },
    mixAdditions: {
      flourGrams: mixFlour,
      flourBreakdown: breakdownByBlend(mixFlour, recipe.flour),
      waterGrams: mixWater,
      saltReserveWaterGrams,
    },
  };
}
