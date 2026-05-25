"use client";

import { useEffect, useState } from "react";
import { Wheat, BookOpen } from "lucide-react";
import { HomeCta } from "./home-cta";
import { ResumeBanner } from "./resume-banner";
import { StopBakeDialog } from "@/components/bake/stop-bake-dialog";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { listRecipes } from "@/lib/storage/recipes";
import { strings } from "@/lib/strings";

export function HomeScreen() {
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [stopOpen, setStopOpen] = useState(false);

  useEffect(() => {
    setRecipeCount(listRecipes().length);
  }, [activeBake?.id]);

  function handleConfirmStop() {
    setStopOpen(false);
    abandon();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-12 pb-10">
      <header className="text-center mb-10">
        <h1 className="text-display-lg font-display text-ink">{strings.home.wordmark}</h1>
        <p className="mt-2 text-body-lg text-ink-2">{strings.home.subtitle}</p>
      </header>

      {!bakeLoading && activeBake && (
        <ResumeBanner
          activeBake={activeBake}
          onStopRequest={() => setStopOpen(true)}
        />
      )}

      <div className="flex flex-col gap-4">
        <HomeCta
          variant="primary"
          href="/bake/new"
          icon={<Wheat size={28} />}
          label={strings.home.startBaking}
        />
        <HomeCta
          variant="secondary"
          href="/recipes"
          icon={<BookOpen size={24} />}
          label={strings.home.myRecipes}
          count={recipeCount ?? undefined}
        />
      </div>

      <StopBakeDialog
        open={stopOpen}
        recipeName={activeBake?.recipe.name ?? ""}
        onConfirm={handleConfirmStop}
        onCancel={() => setStopOpen(false)}
      />
    </main>
  );
}
