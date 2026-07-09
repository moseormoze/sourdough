import type { FeedRatio } from "@/lib/bake-timing";

export interface Feeding {
  id: string;
  email: string;
  ratio: FeedRatio;
  starterGrams: number | null;
  flourGrams: number | null;
  waterGrams: number | null;
  fedAt: string;
  createdAt: string;
}

export interface FeedingInput {
  email: string;
  ratio: FeedRatio;
  starterGrams: number | null;
  flourGrams: number | null;
  waterGrams: number | null;
  fedAt: string;
}
