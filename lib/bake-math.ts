import type { Recipe } from "./types/recipe";

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
    waterGrams: number;
    saltReserveWaterGrams: number;
  };
}

const SALT_RESERVE_WATER_GRAMS = 20;

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
      waterGrams: mixWater,
      saltReserveWaterGrams: SALT_RESERVE_WATER_GRAMS,
    },
  };
}
