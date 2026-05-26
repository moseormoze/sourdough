import type { Flour, Recipe } from "./types/recipe";

export type FlourType = keyof Flour;

export interface FlourBreakdownEntry {
  type: FlourType;
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
  };
  mixAdditions: {
    flourGrams: number;
    flourBreakdown: FlourBreakdownEntry[];
    waterGrams: number;
    saltReserveWaterGrams: number;
  };
}

const SALT_RESERVE_WATER_GRAMS = 20;
const FLOUR_TYPES_ORDER: FlourType[] = ["white", "wholeWheat", "rye", "other"];

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

export function computeBakeQuantities(recipe: Recipe): BakeQuantities {
  const totalFlourGrams = recipe.flourWeightGrams;
  const totalWaterGrams = Math.round((recipe.flourWeightGrams * recipe.hydration) / 100);
  const saltGrams = Math.round((recipe.flourWeightGrams * recipe.salt) / 100);
  const levainTotalGrams = Math.round((recipe.flourWeightGrams * recipe.levain) / 100);

  const levainStarter = Math.round(levainTotalGrams / 3);
  const levainWater = Math.round(levainTotalGrams / 3);
  const levainFlour = Math.round(levainTotalGrams / 3);

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
    },
    mixAdditions: {
      flourGrams: mixFlour,
      flourBreakdown: breakdownByBlend(mixFlour, recipe.flour),
      waterGrams: mixWater,
      saltReserveWaterGrams: SALT_RESERVE_WATER_GRAMS,
    },
  };
}
