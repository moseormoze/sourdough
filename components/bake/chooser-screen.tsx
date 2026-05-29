"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChooserCard } from "./chooser-card";
import { BakeSchedulerSheet } from "./bake-scheduler-sheet";
import { ReplaceBakeDialog } from "./replace-bake-dialog";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { PRESETS, type Preset } from "@/lib/presets";
import { listRecipes } from "@/lib/storage/recipes";
import type { Recipe } from "@/lib/types/recipe";
import type { BakingMethod } from "@/lib/types/baking-method";
import { strings } from "@/lib/strings";

function presetToRecipe(preset: Preset): Recipe {
  const now = Date.now();
  return {
    id: `preset:${preset.id}:${now}`,
    name: preset.name,
    flour: { ...preset.data.flour },
    flourWeightGrams: preset.data.flourWeightGrams ?? 500,
    hydration: preset.data.hydration,
    salt: preset.data.salt,
    levain: preset.data.levain,
    kitchenTemp: preset.data.kitchenTemp,
    inclusions: preset.data.inclusions.map((i) => ({ ...i })),
    createdAt: now,
    updatedAt: now,
  };
}

function summarizeForCard(recipe: { flour: Recipe["flour"]; hydration: number }): string {
  const { flour } = recipe;
  const parts: string[] = [];
  if (flour.white >= 100) parts.push("100% לבן");
  else if (flour.wholeWheat >= 100) parts.push("100% מלא");
  else if (flour.rye >= 100) parts.push("100% שיפון");
  else if (flour.wholeWheat > 0) parts.push(`${flour.wholeWheat}% מלא`);
  else if (flour.rye > 0) parts.push(`${flour.rye}% שיפון`);
  else if (flour.white > 0) parts.push(`${flour.white}% לבן`);
  parts.push(`${recipe.hydration}% הידרציה`);
  return parts.join(" · ");
}

export function ChooserScreen() {
  const router = useRouter();
  const { activeBake, loading: bakeLoading, start, abandon } = useActiveBake();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<Recipe | null>(null);
  const [confirmingRecipe, setConfirmingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(listRecipes());
    setRecipesLoaded(true);
  }, []);

  function beginBake(recipe: Recipe, bakingMethod: BakingMethod, feedAt?: Date, peakAt?: Date) {
    start(recipe, bakingMethod, feedAt, peakAt);
    router.push(feedAt ? "/bake/feed" : "/bake/stage/1");
  }

  function handleSelect(recipe: Recipe) {
    if (activeBake) {
      setPendingRecipe(recipe);
      return;
    }
    setConfirmingRecipe(recipe);
  }

  function handleConfirmAbandon() {
    if (!pendingRecipe) return;
    abandon();
    setConfirmingRecipe(pendingRecipe);
    setPendingRecipe(null);
  }

  function handleCancelAbandon() {
    setPendingRecipe(null);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="relative z-10 flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.recipes.backToHome}
        </Button>
      </header>

      <h1 className="text-display-md text-ink mb-6">{strings.bake.chooserTitle}</h1>

      <h2 className="text-heading text-ink mb-3">{strings.bake.chooserRecipeHeading}</h2>

      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((preset) => (
          <ChooserCard
            key={`preset-${preset.id}`}
            name={preset.name}
            summary={summarizeForCard(preset.data)}
            imageSrc={preset.image}
            onSelect={() => handleSelect(presetToRecipe(preset))}
          />
        ))}
        {recipesLoaded &&
          recipes.map((recipe) => (
            <ChooserCard
              key={`recipe-${recipe.id}`}
              name={recipe.name}
              summary={summarizeForCard(recipe)}
              mine
              onSelect={() => handleSelect(recipe)}
            />
          ))}
      </div>

      <ReplaceBakeDialog
        open={pendingRecipe !== null}
        recipeName={activeBake?.recipe.name ?? ""}
        onConfirm={handleConfirmAbandon}
        onCancel={handleCancelAbandon}
      />

      {confirmingRecipe && (
        <BakeSchedulerSheet
          recipe={confirmingRecipe}
          imageUrl={
            confirmingRecipe.id.startsWith("preset:")
              ? PRESETS.find((p) => p.id === confirmingRecipe.id.split(":")[1])?.image
              : undefined
          }
          onConfirm={(recipe, method, feedAt, peakAt) => {
            beginBake(recipe, method, feedAt, peakAt);
          }}
          onClose={() => setConfirmingRecipe(null)}
        />
      )}

      {bakeLoading && null}
    </main>
  );
}
