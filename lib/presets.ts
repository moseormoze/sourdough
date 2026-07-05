import type { RecipeInput } from "@/lib/types/recipe";

export type PresetTone = "country" | "wheat" | "rye" | "white" | "spelt" | "beginner";

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
      flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0 },
      hydration: 72,
      salt: 2,
      levain: 20,
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
      flour: { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0 },
      hydration: 72,
      salt: 2,
      levain: 20,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "spelt-white",
    name: "כוסמין לבן רך",
    blurb: "עדין וסלחני — טעם כוסמין רך והידרציה נמוכה. פתיחה מצוינת.",
    tone: "beginner",
    image: "/presets/spelt-white.png",
    data: {
      flour: { white: 60, wholeWheat: 0, rye: 0, speltWhite: 40, speltWhole: 0 },
      hydration: 70,
      salt: 2,
      levain: 18,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "country-rye",
    name: "כפרי שיפון",
    blurb: "כפרי עם נגיעת שיפון — טעם עמוק יותר, נשאר סלחני.",
    tone: "rye",
    image: "/presets/country-rye.png",
    data: {
      flour: { white: 80, wholeWheat: 0, rye: 20, speltWhite: 0, speltWhole: 0 },
      hydration: 72,
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
      flour: { white: 30, wholeWheat: 70, rye: 0, speltWhite: 0, speltWhole: 0 },
      hydration: 78,
      salt: 2.2,
      levain: 22,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "spelt50",
    name: "50% כוסמין מלא",
    blurb: "ארומה אגוזית-מתקתקה של כוסמין, מאוזנת עם קמח לבן.",
    tone: "spelt",
    image: "/presets/spelt50.png",
    data: {
      flour: { white: 50, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 50 },
      hydration: 76,
      salt: 2.2,
      levain: 18,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
  {
    id: "rye50",
    name: "50% שיפון",
    blurb: "טעם עמוק וקצת חמצמץ. מעולה עם גבינות.",
    tone: "rye",
    image: "/presets/rye50.png",
    data: {
      flour: { white: 50, wholeWheat: 0, rye: 50, speltWhite: 0, speltWhole: 0 },
      hydration: 78,
      salt: 2.2,
      levain: 25,
      kitchenTemp: 25,
      inclusions: [],
    },
  },
] as const;

export function getPreset(id: string): Preset | null {
  return PRESETS.find((p) => p.id === id) ?? null;
}
