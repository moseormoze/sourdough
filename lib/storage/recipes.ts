import {
  RecipeInputSchema,
  RecipeSchema,
  type Recipe,
  type RecipeInput,
} from "@/lib/types/recipe";

export const STORAGE_KEY = "sourdough:v1:recipes";

function readAll(): Recipe[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const valid: Recipe[] = [];
  for (const item of parsed) {
    const result = RecipeSchema.safeParse(item);
    if (result.success) valid.push(result.data);
  }
  return valid;
}

function writeAll(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function listRecipes(): Recipe[] {
  return [...readAll()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getRecipe(id: string): Recipe | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function saveRecipe(input: RecipeInput): Recipe {
  const parsed = RecipeInputSchema.parse(input);
  const now = Date.now();
  const existing = parsed.id !== undefined ? getRecipe(parsed.id) : null;

  const recipe: Recipe = {
    id: parsed.id ?? crypto.randomUUID(),
    name: parsed.name,
    flour: parsed.flour,
    hydration: parsed.hydration,
    salt: parsed.salt,
    levain: parsed.levain,
    flourWeightGrams: parsed.flourWeightGrams,
    kitchenTemp: parsed.kitchenTemp,
    inclusions: parsed.inclusions,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const all = readAll().filter((r) => r.id !== recipe.id);
  all.push(recipe);
  writeAll(all);
  return recipe;
}

export function deleteRecipe(id: string): void {
  const all = readAll().filter((r) => r.id !== id);
  writeAll(all);
}
