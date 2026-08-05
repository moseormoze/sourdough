"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AMBIENT_CANVAS, AMBIENT_GLASS } from "@/components/ui/ambient";
import { ChooserCard } from "./chooser-card";
import { ChooserLoadingState } from "./chooser-loading-state";
import { ReplaceBakeDialog } from "./replace-bake-dialog";
import { SavedRecipeRow } from "./saved-recipe-row";
import { summarizeRecipe } from "./recipe-summary";
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

export function ChooserScreen() {
  const router = useRouter();
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState<Recipe | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setRecipes(listRecipes());
    setRecipesLoaded(true);
  }, []);

  const resolved = recipesLoaded && !bakeLoading;

  function goToPlanner(recipe: Recipe) {
    savePendingRecipe(recipe);
    router.push("/bake/plan");
  }

  function handleSelect(recipe: Recipe) {
    if (activeBake) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPendingRecipe(recipe);
      return;
    }
    goToPlanner(recipe);
  }

  function handleConfirmAbandon() {
    if (!pendingRecipe) return;
    restoreFocusRef.current = null;
    abandon();
    goToPlanner(pendingRecipe);
    setPendingRecipe(null);
  }

  function handleCancelAbandon() {
    setPendingRecipe(null);
  }

  const handleAfterClose = useCallback(() => {
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }, []);

  return (
    <main
      aria-busy={!resolved}
      className={`relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip ${AMBIENT_CANVAS} px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-[calc(9.25rem+env(safe-area-inset-bottom))] max-[340px]:px-4`}
    >
      <header className="relative z-10 mb-2 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.recipes.backToHome}
        </Button>
      </header>

      <h1 className="mb-6 text-display-md text-ink">{strings.bake.chooserTitle}</h1>

      {!resolved && <ChooserLoadingState />}

      {resolved && (
        <>
          {recipes.length > 0 && (
            <ul
              aria-label={strings.bake.myBadge}
              className={`mb-6 overflow-hidden ${AMBIENT_GLASS} [&>*+*]:border-t [&>*+*]:border-ink/[0.06]`}
            >
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <SavedRecipeRow
                    name={recipe.name}
                    summary={summarizeRecipe(recipe)}
                    onSelect={() => handleSelect(recipe)}
                  />
                </li>
              ))}
            </ul>
          )}

          <h2 className="mb-3 text-heading text-ink">{strings.bake.chooserRecipeHeading}</h2>

          <ul
            aria-label={strings.bake.chooserRecipeHeading}
            className="grid grid-cols-2 gap-4 max-[340px]:gap-3"
          >
            {PRESETS.map((preset) => (
              <li key={preset.id}>
                <ChooserCard
                  name={preset.name}
                  summary={summarizeRecipe(preset.data)}
                  imageSrc={preset.image}
                  onSelect={() => handleSelect(presetToRecipe(preset))}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <ReplaceBakeDialog
        open={pendingRecipe !== null}
        appearance="ambient"
        recipeName={activeBake?.recipe.name ?? ""}
        onConfirm={handleConfirmAbandon}
        onCancel={handleCancelAbandon}
        onAfterClose={handleAfterClose}
      />
    </main>
  );
}
