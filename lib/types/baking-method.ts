import { z } from "zod";

export const BAKING_METHODS = ["closed-vessel", "open-with-steam", "other"] as const;

const LEGACY_METHOD_MAP: Record<string, (typeof BAKING_METHODS)[number]> = {
  "dutch-oven": "closed-vessel",
  "stone-with-steam": "open-with-steam",
  "tray-with-bowl": "other",
};

export const BakingMethodSchema = z.preprocess((val) => {
  if (typeof val === "string" && val in LEGACY_METHOD_MAP) {
    return LEGACY_METHOD_MAP[val];
  }
  return val;
}, z.enum(BAKING_METHODS));

export type BakingMethod = z.infer<typeof BakingMethodSchema>;

export const DEFAULT_BAKING_METHOD: BakingMethod = "closed-vessel";
