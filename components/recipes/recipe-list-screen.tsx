"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EmptyRecipesState } from "./empty-recipes-state";
import { RecipeListItem } from "./recipe-list-item";
import { deleteRecipe, listRecipes } from "@/lib/storage/recipes";
import type { Recipe } from "@/lib/types/recipe";
import { strings } from "@/lib/strings";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; recipes: Recipe[] };

const UNDO_WINDOW_MS = 2400;

export function RecipeListScreen() {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState({ status: "loaded", recipes: listRecipes() });
  }, []);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);

  const handleCommitDelete = useCallback(
    (recipe: Recipe) => {
      // If a previous undo is still pending, finalize it now so we don't lose it.
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }

      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.add(recipe.id);
        return next;
      });

      const handleUndo = () => {
        if (pendingTimerRef.current) {
          clearTimeout(pendingTimerRef.current);
          pendingTimerRef.current = null;
        }
        setHiddenIds((prev) => {
          const next = new Set(prev);
          next.delete(recipe.id);
          return next;
        });
      };

      toast.show(`"${recipe.name}" נמחק`, {
        action: { label: strings.common.undo, onPress: handleUndo },
        durationMs: UNDO_WINDOW_MS,
      });

      pendingTimerRef.current = setTimeout(() => {
        deleteRecipe(recipe.id);
        setState((current) => {
          if (current.status !== "loaded") return current;
          return {
            status: "loaded",
            recipes: current.recipes.filter((r) => r.id !== recipe.id),
          };
        });
        setHiddenIds((prev) => {
          const next = new Set(prev);
          next.delete(recipe.id);
          return next;
        });
        pendingTimerRef.current = null;
      }, UNDO_WINDOW_MS);
    },
    [toast]
  );

  // Restore from storage on undo: if the recipe got removed from storage by the
  // timer before undo fired, we need to put it back. But our timer-runs-then-
  // delete pattern means undo always fires *before* deleteRecipe is called, so
  // storage is still intact. The hiddenIds set is the only thing to clear.
  // (Kept here as a TODO marker if we ever switch to eager delete.)

  const visibleRecipes =
    state.status === "loaded"
      ? state.recipes.filter((r) => !hiddenIds.has(r.id))
      : [];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="relative z-10 flex items-center gap-2 mb-6">
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
        {state.status === "loaded" && visibleRecipes.length > 0 && (
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

      {state.status === "loaded" && visibleRecipes.length === 0 && (
        <EmptyRecipesState />
      )}

      {state.status === "loaded" && visibleRecipes.length > 0 && (
        <ul
          aria-label={strings.recipes.pageTitle}
          className="flex flex-col gap-3"
        >
          {visibleRecipes.map((r) => (
            <li key={r.id}>
              <RecipeListItem recipe={r} onCommitDelete={handleCommitDelete} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
