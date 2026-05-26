import { z } from "zod";

export const BAKING_METHODS = ["dutch-oven", "stone-with-steam", "tray-with-bowl"] as const;

export const BakingMethodSchema = z.enum(BAKING_METHODS);

export type BakingMethod = z.infer<typeof BakingMethodSchema>;

export const DEFAULT_BAKING_METHOD: BakingMethod = "dutch-oven";
