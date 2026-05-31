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
  // Set when bake starts with starter not yet at peak; kept as historical timestamps after feed stage
  feedAt: z.number().int().nullable().default(null),
  peakAt: z.number().int().nullable().default(null),
  // True once the user confirms starter is ready and advances past the feed stage
  feedStagePassed: z.boolean().default(false),
  // Feed ratio chosen in the planner (1:N:N). Defaults so old saves stay valid.
  feedRatio: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  ]).default(DEFAULT_FEED_RATIO),
});

export type ActiveBake = z.infer<typeof ActiveBakeSchema>;
