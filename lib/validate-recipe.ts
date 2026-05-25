import { strings } from "@/lib/strings";

export interface InclusionInput {
  name: string;
  amountGrams: number | "";
}

export interface InclusionError {
  name: string | null;
  amountGrams: string | null;
}

export interface RecipeFormValues {
  name: string;
  flour: {
    white: number | "";
    wholeWheat: number | "";
    rye: number | "";
    other: number | "";
  };
  hydration: number | "";
  salt: number | "";
  levain: number | "";
  kitchenTemp: number | "";
  inclusions: InclusionInput[];
}

export interface RecipeFormErrors {
  name: string | null;
  flour: string | null;
  hydration: string | null;
  salt: string | null;
  levain: string | null;
  kitchenTemp: string | null;
  inclusions: InclusionError[];
}

export function emptyRecipeFormValues(): RecipeFormValues {
  return {
    name: "",
    flour: { white: "", wholeWheat: "", rye: "", other: "" },
    hydration: "",
    salt: "",
    levain: "",
    kitchenTemp: 25,
    inclusions: [],
  };
}

export function flourTotal(flour: RecipeFormValues["flour"]): number {
  const v = (x: number | "") => (typeof x === "number" ? x : 0);
  return v(flour.white) + v(flour.wholeWheat) + v(flour.rye) + v(flour.other);
}

function checkRange(
  value: number | "",
  min: number,
  max: number,
  rangeMessage: string
): string | null {
  if (value === "") return rangeMessage;
  if (value < min || value > max) return rangeMessage;
  return null;
}

function validateInclusion(inc: InclusionInput): InclusionError {
  const v = strings.validationCopy;
  return {
    name: inc.name.trim() === "" ? v.inclusionNameRequired : null,
    amountGrams:
      inc.amountGrams === "" || inc.amountGrams <= 0 ? v.inclusionAmountPositive : null,
  };
}

export function validateRecipe(values: RecipeFormValues): RecipeFormErrors {
  const v = strings.validationCopy;

  const errors: RecipeFormErrors = {
    name: null,
    flour: null,
    hydration: null,
    salt: null,
    levain: null,
    kitchenTemp: null,
    inclusions: values.inclusions.map(validateInclusion),
  };

  if (values.name.trim() === "") errors.name = v.nameRequired;

  const sum = flourTotal(values.flour);
  if (Math.abs(sum - 100) >= 0.01) {
    errors.flour = v.flourSumWrong(sum);
  }

  errors.hydration = checkRange(values.hydration, 50, 100, v.hydrationRange);
  errors.salt = checkRange(values.salt, 0, 5, v.saltRange);
  errors.levain = checkRange(values.levain, 0, 40, v.levainRange);
  errors.kitchenTemp = checkRange(values.kitchenTemp, 10, 40, v.tempRange);

  return errors;
}

export function hasAnyError(errors: RecipeFormErrors): boolean {
  const fieldErrors = [
    errors.name,
    errors.flour,
    errors.hydration,
    errors.salt,
    errors.levain,
    errors.kitchenTemp,
  ];
  if (fieldErrors.some((e) => e !== null)) return true;
  return errors.inclusions.some((i) => i.name !== null || i.amountGrams !== null);
}
