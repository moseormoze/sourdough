"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export function EmptyRecipesState() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div
        className="text-[64px] leading-none mb-6"
        aria-hidden
      >
        🍞
      </div>
      <h2 className="text-display-sm text-ink">{strings.recipes.emptyTitle}</h2>
      <p className="mt-2 max-w-xs text-body-lg text-ink-2">
        {strings.recipes.emptyDescription}
      </p>
      <div className="mt-8">
        <Button variant="accent" onClick={() => router.push("/recipes/new")}>
          {strings.recipes.newRecipe}
        </Button>
      </div>
    </div>
  );
}
