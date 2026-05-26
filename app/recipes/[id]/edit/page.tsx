"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RecipeFormScreen } from "@/components/recipes/recipe-form-screen";
import { getRecipe } from "@/lib/storage/recipes";
import type { RecipeFormValues } from "@/lib/validate-recipe";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<RecipeFormValues | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    const recipe = getRecipe(id);
    if (!recipe) {
      setMissing(true);
      return;
    }
    setInitial({
      name: recipe.name,
      flour: { ...recipe.flour },
      flourWeightGrams: recipe.flourWeightGrams,
      hydration: recipe.hydration,
      salt: recipe.salt,
      levain: recipe.levain,
      kitchenTemp: recipe.kitchenTemp,
      inclusions: recipe.inclusions.map((i) => ({ ...i })),
    });
  }, [params.id]);

  useEffect(() => {
    if (missing) router.replace("/recipes");
  }, [missing, router]);

  if (!initial) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
        <p className="text-ink-2 mt-12 text-center">טוען…</p>
      </main>
    );
  }

  return <RecipeFormScreen initialValues={initial} recipeId={params.id} />;
}
