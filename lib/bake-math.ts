import { DEFAULT_FEED_RATIO, type FeedRatio } from "./bake-timing";
import type { Flour, Recipe } from "./types/recipe";

export type FlourType = keyof Flour;

/** Flour types shown in the levain/mix breakdown. Excludes the legacy `other`
 * bucket (never authored, always 0) — its label was retired with spelt. */
const FLOUR_TYPES_ORDER = ["white", "wholeWheat", "rye", "speltWhite", "speltWhole"] as const;
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

const SALT_RESERVE_WATER_GRAMS = 20;

function breakdownByBlend(totalGrams: number, blend: Flour): FlourBreakdownEntry[] {
  const entries = FLOUR_TYPES_ORDER.map((type) => ({
    type,
    grams: Math.round((totalGrams * blend[type]) / 100),
  })).filter((e) => e.grams > 0);

  // Fix rounding drift so the breakdown sums to totalGrams exactly.
  const sum = entries.reduce((acc, e) => acc + e.grams, 0);
  const drift = totalGrams - sum;
  if (drift !== 0 && entries.length > 0) {
    // Push the drift onto the largest entry — minimizes relative error.
    const largest = entries.reduce((a, b) => (a.grams >= b.grams ? a : b));
    largest.grams += drift;
  }
  return entries;
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
  const mixWater = Math.round(
    totalWaterGrams - levainWater - levainStarter / 2 - SALT_RESERVE_WATER_GRAMS
  );

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
      saltReserveWaterGrams: SALT_RESERVE_WATER_GRAMS,
    },
  };
}
