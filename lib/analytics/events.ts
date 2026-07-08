/**
 * The closed set of analytics events the app emits. Adding an event means
 * adding it here so we get type-safety on payloads at the call site.
 */
export type AnalyticsEvent =
  | { name: "bake_started"; props: { recipeName: string; bakingMethod: string; flourWeightGrams: number } }
  | { name: "stage_advanced"; props: { from: number; to: number } }
  | { name: "stage_substep_advanced"; props: { stage: number; subStep: number } }
  | { name: "bake_completed"; props: { recipeName: string; bakingMethod: string; durationMinutes: number } }
  | { name: "bake_abandoned"; props: { atStage: number; recipeName: string } }
  | { name: "recipe_created"; props: { name: string; flourWeightGrams: number; hydration: number } }
  | { name: "recipe_deleted"; props: { recipeId: string } }
  | { name: "baking_method_selected"; props: { method: string } }
  | { name: "timer_started"; props: { stage: number; durationSeconds: number } }
  | { name: "identify_completed"; props: Record<string, never> };

export type AnalyticsEventName = AnalyticsEvent["name"];
