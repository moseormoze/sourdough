"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyRecipesState } from "./empty-recipes-state";
import { listRecipes } from "@/lib/storage/recipes";
import type { Recipe } from "@/lib/types/recipe";
import { strings } from "@/lib/strings";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; recipes: Recipe[] };

export function RecipeListScreen() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loaded", recipes: listRecipes() });
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.recipes.backToHome}
        </Button>
        <div className="flex-1" />
      </header>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-display-md text-ink">{strings.recipes.pageTitle}</h1>
        {state.status === "loaded" && state.recipes.length > 0 && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => router.push("/recipes/new")}
          >
            {strings.recipes.newRecipe}
          </Button>
        )}
      </div>

      {state.status === "loading" && <div aria-hidden className="h-10" />}

      {state.status === "loaded" && state.recipes.length === 0 && <EmptyRecipesState />}

      {state.status === "loaded" && state.recipes.length > 0 && (
        <ul
          aria-label={strings.recipes.pageTitle}
          className="flex flex-col gap-3"
        >
          {state.recipes.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-paper shadow-sm p-4 text-ink"
              data-recipe-id={r.id}
            >
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
