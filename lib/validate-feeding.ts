import type { FeedRatio } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";

export interface FeedingFormValues {
  ratio: FeedRatio | null;
  starterGrams: number | "";
  flourGrams: number | "";
  waterGrams: number | "";
  fedAtDate: string;
  fedAtTime: string;
}

export interface FeedingFormErrors {
  ratio: string | null;
  starterGrams: string | null;
  flourGrams: string | null;
  waterGrams: string | null;
  fedAtDate: string | null;
  fedAtTime: string | null;
}

export function emptyFeedingFormValues(): FeedingFormValues {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    ratio: null,
    starterGrams: "",
    flourGrams: "",
    waterGrams: "",
    fedAtDate: `${year}-${month}-${day}`,
    fedAtTime: "",
  };
}

function checkNonNegativeGrams(value: number | ""): string | null {
  if (value === "") return null;
  if (value < 0) return strings.starterTracker.validation.gramsNegative;
  return null;
}

export function validateFeeding(values: FeedingFormValues): FeedingFormErrors {
  const v = strings.starterTracker.validation;

  return {
    ratio: values.ratio === null ? v.ratioRequired : null,
    starterGrams: checkNonNegativeGrams(values.starterGrams),
    flourGrams: checkNonNegativeGrams(values.flourGrams),
    waterGrams: checkNonNegativeGrams(values.waterGrams),
    fedAtDate: values.fedAtDate.trim() === "" ? v.dateRequired : null,
    fedAtTime: null,
  };
}

export function hasAnyError(errors: FeedingFormErrors): boolean {
  return Object.values(errors).some((e) => e !== null);
}
