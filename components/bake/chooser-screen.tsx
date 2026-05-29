"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChooserCard } from "./chooser-card";
import { BakeConfirmSheet } from "./bake-confirm-sheet";
import { ReplaceBakeDialog } from "./replace-bake-dialog";
import { StarterGateStep } from "./starter-gate-step";
import { StarterScheduleStep } from "./starter-schedule-step";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { PRESETS, type Preset } from "@/lib/presets";
import { listRecipes } from "@/lib/storage/recipes";
import type { Recipe } from "@/lib/types/recipe";
import type { BakingMethod } from "@/lib/types/baking-method";
import { strings } from "@/lib/strings";

type Step = "gate" | "scheduling" | "choosing";

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
  const [step, setStep] = useState<Step>("gate");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  // Recipe waiting for replace-confirmation (when a bake is already active)
  const [pendingRecipe, setPendingRecipe] = useState<Recipe | null>(null);
  // Recipe whose confirm sheet is open
  const [confirmingRecipe, setConfirmingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(listRecipes());
    setRecipesLoaded(true);
  }, []);

  function beginBake(recipe: Recipe, bakingMethod: BakingMethod) {
    start(recipe, bakingMethod);
    router.push("/bake/stage/1");
  }

  function handleEdit() {
    const recipe = confirmingRecipe;
    if (!recipe) return;
    setConfirmingRecipe(null);

    // Preset: navigate to the preset's new-recipe form pre-filled
    if (recipe.id.startsWith("preset:")) {
      const presetId = recipe.id.split(":")[1];
      router.push(`/recipes/new/${presetId}?returnToBake=1`);
      return;
    }

    // Saved recipe: navigate to its edit page
    router.push(`/recipes/${recipe.id}/edit?returnToBake=1`);
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

  if (step === "gate") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
        <header className="relative z-10 flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            iconStart={<ChevronRight size={20} aria-hidden />}
          >
            {strings.recipes.backToHome}
          </Button>
        </header>
        <StarterGateStep
          onReady={() => setStep("choosing")}
          onNotReady={() => setStep("scheduling")}
        />
      </main>
    );
  }

  if (step === "scheduling") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
        <header className="relative z-10 flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("gate")}
            iconStart={<ChevronRight size={20} aria-hidden />}
          >
            {strings.recipes.backToHome}
          </Button>
        </header>
        <StarterScheduleStep onDismiss={() => router.back()} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="relative z-10 flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("gate")}
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
        <BakeConfirmSheet
          recipe={confirmingRecipe}
          imageUrl={
            confirmingRecipe.id.startsWith("preset:")
              ? PRESETS.find((p) => p.id === confirmingRecipe.id.split(":")[1])?.image
              : undefined
          }
          onConfirm={(recipe, method) => {
            setConfirmingRecipe(null);
            beginBake(recipe, method);
          }}
          onEdit={handleEdit}
          onClose={() => setConfirmingRecipe(null)}
        />
      )}

      {bakeLoading && null}
    </main>
  );
}
