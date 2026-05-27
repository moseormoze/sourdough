"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Wheat, BookOpen } from "lucide-react";
import { HomeCta } from "./home-cta";
import { ResumeBanner } from "./resume-banner";
import { StopBakeDialog } from "@/components/bake/stop-bake-dialog";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { listRecipes } from "@/lib/storage/recipes";
import { strings } from "@/lib/strings";
import { track } from "@/lib/analytics/track";

export function HomeScreen() {
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [stopOpen, setStopOpen] = useState(false);

  useEffect(() => {
    setRecipeCount(listRecipes().length);
  }, [activeBake?.id]);

  function handleConfirmStop() {
    if (activeBake) {
      track("bake_abandoned", {
        atStage: activeBake.currentStage,
        recipeName: activeBake.recipe.name,
      });
    }
    setStopOpen(false);
    abandon();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-8 pb-10">
      <header className="text-center mb-6">
        <h1 className="sr-only">{strings.home.wordmark}</h1>
        <Image
          src="/logo.svg"
          alt={strings.home.wordmark}
          width={280}
          height={280}
          priority
          className="mx-auto"
        />
        <p className="text-body-lg text-ink-2">{strings.home.subtitle}</p>
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
