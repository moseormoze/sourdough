import { z } from "zod";
import { RecipeSchema } from "./recipe";
import { BakingMethodSchema, DEFAULT_BAKING_METHOD } from "./baking-method";
import { DEFAULT_FEED_RATIO } from "@/lib/bake-timing";

export const ActiveBakeSchema = z.object({
  id: z.string().min(1),
  recipe: RecipeSchema,
  startedAt: z.number().int().positive(),
  currentStage: z.number().int().min(1).max(12),
  stageStartedAt: z.number().int().positive(),
  observationChecks: z.record(z.string(), z.record(z.string(), z.boolean())).default({}),
  subStep: z.number().int().min(0).default(0),
  timerStartedAt: z.number().int().nullable().default(null),
  timerElapsedSeconds: z.number().min(0).default(0),
  bakingMethod: BakingMethodSchema.default(DEFAULT_BAKING_METHOD),
  // Timestamps of the planned levain build; preserved for F17 adaptive timeline
  feedAt: z.number().int().nullable().default(null),
  peakAt: z.number().int().nullable().default(null),
  // Feed ratio chosen in the planner (1:N:N). Defaults so old saves stay valid.
  feedRatio: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  ]).default(DEFAULT_FEED_RATIO),
  // Cold retard duration chosen by the user in the planner slider. Defaults so old saves stay valid.
  retardHours: z.number().int().min(8).max(48).default(12),
});

export type ActiveBake = z.infer<typeof ActiveBakeSchema>;
