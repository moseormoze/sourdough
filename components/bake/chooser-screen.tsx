"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChooserCard } from "./chooser-card";
import { ReplaceBakeDialog } from "./replace-bake-dialog";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { savePendingRecipe } from "@/lib/storage/pending-plan";
import { PRESETS, type Preset } from "@/lib/presets";
import { listRecipes } from "@/lib/storage/recipes";
import type { Recipe } from "@/lib/types/recipe";
import { strings } from "@/lib/strings";

function presetToRecipe(preset: Preset): Recipe {
  const now = Date.now();
  return {
    id: `preset:${preset.id}:${now}`,
    name: preset.name,
    flour: {
      white: preset.data.flour.white,
      wholeWheat: preset.data.flour.wholeWheat,
      rye: preset.data.flour.rye,
      speltWhite: preset.data.flour.speltWhite ?? 0,
      speltWhole: preset.data.flour.speltWhole ?? 0,
      other: preset.data.flour.other ?? 0,
    },
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

type SummaryFlour = {
  white: number;
  wholeWheat: number;
  rye: number;
  speltWhite?: number;
  speltWhole?: number;
};

function summarizeForCard(recipe: { flour: SummaryFlour; hydration: number }): string {
  const { white, wholeWheat, rye } = recipe.flour;
  const speltWhite = recipe.flour.speltWhite ?? 0;
  const speltWhole = recipe.flour.speltWhole ?? 0;
  const parts: string[] = [];
  if (white >= 100) parts.push("100% לבן");
  else if (wholeWheat >= 100) parts.push("100% מלא");
  else if (rye >= 100) parts.push("100% שיפון");
  else if (speltWhole >= 100) parts.push("100% כוסמין מלא");
  else if (speltWhite >= 100) parts.push("100% כוסמין לבן");
  else if (wholeWheat > 0) parts.push(`${wholeWheat}% מלא`);
  else if (rye > 0) parts.push(`${rye}% שיפון`);
  else if (speltWhole > 0) parts.push(`${speltWhole}% כוסמין מלא`);
  else if (speltWhite > 0) parts.push(`${speltWhite}% כוסמין לבן`);
  else if (white > 0) parts.push(`${white}% לבן`);
  parts.push(`${recipe.hydration}% הידרציה`);
  return parts.join(" · ");
}

export function ChooserScreen() {
  const router = useRouter();
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(listRecipes());
    setRecipesLoaded(true);
  }, []);

  function goToPlanner(recipe: Recipe) {
    savePendingRecipe(recipe);
    router.push("/bake/plan");
  }

  function handleSelect(recipe: Recipe) {
    if (activeBake) {
      setPendingRecipe(recipe);
      return;
    }
    goToPlanner(recipe);
  }

  function handleConfirmAbandon() {
    if (!pendingRecipe) return;
    abandon();
    goToPlanner(pendingRecipe);
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

      {bakeLoading && null}
    </main>
  );
}
