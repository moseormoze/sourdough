import { RecipeSchema, type Recipe } from "@/lib/types/recipe";

// Transient handoff: the chooser stashes the recipe being planned, the
// /bake/plan screen reads it. sessionStorage so it doesn't outlive the tab.
export const PENDING_PLAN_STORAGE_KEY = "sourdough:v1:pending-plan";

export function savePendingRecipe(recipe: Recipe): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_PLAN_STORAGE_KEY, JSON.stringify(recipe));
}

export function loadPendingRecipe(): Recipe | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_PLAN_STORAGE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = RecipeSchema.safeParse(parsed);
  if (!result.success) return null;
  return result.data;
}

export function clearPendingRecipe(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
}
