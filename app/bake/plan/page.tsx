"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BakePlannerScreen } from "@/components/bake/bake-planner-screen";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { loadPendingRecipe, clearPendingRecipe } from "@/lib/storage/pending-plan";
import { PRESETS } from "@/lib/presets";
import type { Recipe } from "@/lib/types/recipe";
import type { BakingMethod } from "@/lib/types/baking-method";
import type { FeedRatio } from "@/lib/bake-timing";

function presetImageFor(recipe: Recipe): string | undefined {
  if (!recipe.id.startsWith("preset:")) return undefined;
  const presetId = recipe.id.split(":")[1];
  return PRESETS.find((p) => p.id === presetId)?.image;
}

export default function Page() {
  const router = useRouter();
  const { start } = useActiveBake();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const pending = loadPendingRecipe();
    if (!pending) {
      router.replace("/bake/new");
      return;
    }
    setRecipe(pending);
    setResolved(true);
  }, [router]);

  if (!resolved || !recipe) return null;

  function handleConfirm(
    chosen: Recipe,
    method: BakingMethod,
    feedAt?: Date,
    peakAt?: Date,
    feedRatio?: FeedRatio,
  ) {
    start(chosen, method, feedAt, peakAt, feedRatio);
    clearPendingRecipe();
    router.push(feedAt ? "/bake/feed" : "/bake/stage/1");
  }

  return (
    <BakePlannerScreen
      recipe={recipe}
      imageUrl={presetImageFor(recipe)}
      onConfirm={handleConfirm}
      onBack={() => router.back()}
    />
  );
}
