import { recommendFor } from "@/lib/recommendations";
import { strings } from "@/lib/strings";
import { STRETCH_AND_FOLD_VIDEO } from "./stages";
import type { RecipeFormValues } from "@/lib/validate-recipe";

/**
 * Guidance keys are shared across guides: the factors that change what a stage
 * means for THIS dough are the same everywhere — flour, hydration, temperature.
 */
export type StageGuidanceKey =
  | "spelt"
  | "wholeWheat"
  | "rye"
  | "generic"
  | "highHydration"
  | "lowHydration"
  | "warmKitchen";

export interface StageKnowledgeContent {
  title: string;
  /** Label of the trigger that opens this guide on the stage screen. */
  triggerLabel: string;
  intro: string;
  mechanism: { heading: string; body: string };
  /** Only where a trade-off is genuinely quantitative. Guides may omit it. */
  graph?: {
    title: string;
    badge: string;
    startLabel: string;
    endLabel: string;
    hydrationLabel: string;
    weakeningLabel: string;
    description: string;
  };
  /** A technique section with an optional inline demo, where one applies. */
  folds?: {
    heading: string;
    body: string;
    youtubeId?: string;
    videoCaption?: string;
  };
  recipeContext: {
    heading: string;
    /** Partial: a factor with no approved copy yet simply shows nothing. */
    guidance: Partial<Record<StageGuidanceKey, string>>;
  };
  practicalCheck?: string;
  decisionRule: string;
}

export const AUTOLYSE_GUIDE: StageKnowledgeContent =
  strings.bake.stageKnowledge.guides.autolyse;

export const BULK_GUIDE: StageKnowledgeContent = {
  ...strings.bake.stageKnowledge.guides.bulk,
  folds: {
    ...strings.bake.stageKnowledge.guides.bulk.folds,
    youtubeId: STRETCH_AND_FOLD_VIDEO.youtubeId,
    videoCaption: STRETCH_AND_FOLD_VIDEO.videoCaption,
  },
  // The stage already shows this rule under the signs; the guide repeats the
  // approved wording rather than introducing a second one.
  decisionRule: strings.bake.bulkDecisionRule,
};

/** Stage number → its deep-dive guide. Stages absent here have no depth layer. */
export const STAGE_KNOWLEDGE: Readonly<Record<number, StageKnowledgeContent>> = {
  2: AUTOLYSE_GUIDE,
  4: BULK_GUIDE,
};

type StageGuidanceContext = Pick<
  RecipeFormValues,
  "flour" | "hydration" | "kitchenTemp"
> & {
  /** Measured dough temperature. Fermentation follows the dough, not the room. */
  doughTempC?: number | null;
};

function valueOf(value: number | ""): number {
  return typeof value === "number" ? value : 0;
}

function flourGuidance(
  flour: StageGuidanceContext["flour"],
): Extract<StageGuidanceKey, "spelt" | "wholeWheat" | "rye" | "generic"> {
  if (valueOf(flour.speltWhole) >= 30 || valueOf(flour.speltWhite) >= 50) {
    return "spelt";
  }
  if (valueOf(flour.wholeWheat) >= 50) return "wholeWheat";
  if (valueOf(flour.rye) >= 30) return "rye";
  return "generic";
}

export function getStageGuidance(
  context: StageGuidanceContext,
): readonly StageGuidanceKey[] {
  const factors: StageGuidanceKey[] = [flourGuidance(context.flour)];

  if (typeof context.hydration === "number") {
    const referenceHydration = recommendFor(context.flour).hydration;
    if (context.hydration > referenceHydration + 2) {
      factors.push("highHydration");
    } else if (context.hydration < referenceHydration - 2) {
      factors.push("lowHydration");
    }
  }

  const temp =
    typeof context.doughTempC === "number" ? context.doughTempC : context.kitchenTemp;
  if (typeof temp === "number" && temp >= 26) {
    factors.push("warmKitchen");
  }

  return factors.slice(0, 3);
}

export function getStageKnowledge(stageN: number): StageKnowledgeContent | null {
  return STAGE_KNOWLEDGE[stageN] ?? null;
}
