import { ActiveBakeSchema, type ActiveBake } from "@/lib/types/active-bake";

export const ACTIVE_BAKE_STORAGE_KEY = "sourdough:v1:active-bake";

export function loadActiveBake(): ActiveBake | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(ACTIVE_BAKE_STORAGE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = ActiveBakeSchema.safeParse(parsed);
  if (!result.success) return null;
  return result.data;
}

export function saveActiveBake(bake: ActiveBake): void {
  localStorage.setItem(ACTIVE_BAKE_STORAGE_KEY, JSON.stringify(bake));
}

export function clearActiveBake(): void {
  localStorage.removeItem(ACTIVE_BAKE_STORAGE_KEY);
}
