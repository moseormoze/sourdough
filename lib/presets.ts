import type { RecipeInput } from "@/lib/types/recipe";

export type PresetTone = "country" | "wheat" | "rye" | "white" | "wholedark" | "beginner";

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  tone: PresetTone;
  image: string;
  data: Omit<RecipeInput, "name" | "id">;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "country",
    name: "כפרי קלאסי",
    blurb: "הקלאסיקה. קרום פריך, פירור פתוח, חמיצות עדינה.",
    tone: "country",
    image: "/presets/country.png",
    data: {
      flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
      hydration: 75,
      salt: 2,
      levain: 20,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "wheat70",
    name: "70% מלא",
    blurb: "עשיר, אגוזי, פירור צפוף יותר.",
    tone: "wheat",
    image: "/presets/wheat70.png",
    data: {
      flour: { white: 30, wholeWheat: 70, rye: 0, other: 0 },
      hydration: 78,
      salt: 2.2,
      levain: 22,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "rye50",
    name: "שיפון 50%",
    blurb: "טעם עמוק וקצת חמצמץ. מעולה עם גבינות.",
    tone: "rye",
    image: "/presets/rye50.png",
    data: {
      flour: { white: 50, wholeWheat: 0, rye: 50, other: 0 },
      hydration: 78,
      salt: 2.2,
      levain: 25,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "white",
    name: "לבן בסיסי",
    blurb: "פירור פתוח, קרום זהוב. בייק רך וחגיגי.",
    tone: "white",
    image: "/presets/white.png",
    data: {
      flour: { white: 100, wholeWheat: 0, rye: 0, other: 0 },
      hydration: 72,
      salt: 2,
      levain: 20,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "whole100",
    name: "מלא 100%",
    blurb: "מאתגר אך מתגמל. ארומה עזה, צבע כהה.",
    tone: "wholedark",
    image: "/presets/wholedark.png",
    data: {
      flour: { white: 0, wholeWheat: 100, rye: 0, other: 0 },
      hydration: 82,
      salt: 2.2,
      levain: 22,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "beginner",
    name: "כפרי קל למתחילים",
    blurb: "הידרציה נמוכה — קל לעיצוב, סלחני יחסית.",
    tone: "beginner",
    image: "/presets/beginner.png",
    data: {
      flour: { white: 90, wholeWheat: 10, rye: 0, other: 0 },
      hydration: 70,
      salt: 2,
      levain: 18,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
] as const;

export function getPreset(id: string): Preset | null {
  return PRESETS.find((p) => p.id === id) ?? null;
}
