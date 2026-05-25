"use client";

import { useEffect, useState } from "react";
import { Wheat, BookOpen } from "lucide-react";
import { HomeCta } from "./home-cta";
import { ResumeCard } from "./resume-card";
import { AbandonBakeDialog } from "@/components/bake/abandon-bake-dialog";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { listRecipes } from "@/lib/storage/recipes";
import { strings } from "@/lib/strings";

export function HomeScreen() {
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [abandonOpen, setAbandonOpen] = useState(false);

  useEffect(() => {
    setRecipeCount(listRecipes().length);
  }, [activeBake?.id]);

  function handleConfirmAbandon() {
    setAbandonOpen(false);
    abandon();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-16 pb-10">
      <header className="text-center mb-12">
        <h1 className="text-display-lg font-display text-ink">{strings.home.wordmark}</h1>
        <p className="mt-2 text-body-lg text-ink-2">{strings.home.subtitle}</p>
      </header>

      {bakeLoading ? (
        <div aria-hidden className="h-32" />
      ) : activeBake ? (
        <ResumeCard
          activeBake={activeBake}
          onAbandonRequest={() => setAbandonOpen(true)}
        />
      ) : (
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
      )}

      <AbandonBakeDialog
        open={abandonOpen}
        recipeName={activeBake?.recipe.name ?? ""}
        onConfirm={handleConfirmAbandon}
        onCancel={() => setAbandonOpen(false)}
      />
    </main>
  );
}
