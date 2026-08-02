import { recommendFor } from "@/lib/recommendations";
import { strings } from "@/lib/strings";
import type { RecipeFormValues } from "@/lib/validate-recipe";

export const AUTOLYSE_GUIDE = strings.bake.stageKnowledge.guide;

export type StageKnowledgeContent = typeof AUTOLYSE_GUIDE;
export type AutolyseGuidanceKey =
  keyof StageKnowledgeContent["recipeContext"]["guidance"];

type AutolyseContext = Pick<
  RecipeFormValues,
  "flour" | "hydration" | "kitchenTemp"
>;

function valueOf(value: number | ""): number {
  return typeof value === "number" ? value : 0;
}

function flourGuidance(
  flour: AutolyseContext["flour"],
): Extract<AutolyseGuidanceKey, "spelt" | "wholeWheat" | "rye" | "generic"> {
  if (valueOf(flour.speltWhole) >= 30 || valueOf(flour.speltWhite) >= 50) {
    return "spelt";
  }
  if (valueOf(flour.wholeWheat) >= 50) return "wholeWheat";
  if (valueOf(flour.rye) >= 30) return "rye";
  return "generic";
}

export function getAutolyseGuidance(
  context: AutolyseContext,
): readonly AutolyseGuidanceKey[] {
  const factors: AutolyseGuidanceKey[] = [flourGuidance(context.flour)];

  if (typeof context.hydration === "number") {
    const referenceHydration = recommendFor(context.flour).hydration;
    if (context.hydration > referenceHydration + 2) {
      factors.push("highHydration");
    } else if (context.hydration < referenceHydration - 2) {
      factors.push("lowHydration");
    }
  }

  if (typeof context.kitchenTemp === "number" && context.kitchenTemp >= 26) {
    factors.push("warmKitchen");
  }

  return factors.slice(0, 3);
}

export function getStageKnowledge(stageN: number): StageKnowledgeContent | null {
  return stageN === 2 ? AUTOLYSE_GUIDE : null;
}
