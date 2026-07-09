"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Wheat, BookOpen, Sprout } from "lucide-react";
import { HomeCta } from "./home-cta";
import { ResumeBanner } from "./resume-banner";
import { InstallBanner } from "@/components/onboarding/install-banner";
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

  const hasActiveBake = !bakeLoading && !!activeBake;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
      <header
        className={
          hasActiveBake
            ? "flex items-center justify-center mb-5"
            : "text-center mb-5"
        }
      >
        <h1 className="sr-only">{strings.home.wordmark}</h1>
        <Image
          src="/logo.svg"
          alt={strings.home.wordmark}
          width={hasActiveBake ? 96 : 180}
          height={hasActiveBake ? 96 : 180}
          priority
          className="mx-auto"
        />
        {!hasActiveBake && (
          <p className="mt-2 text-body-lg text-ink-2">{strings.home.subtitle}</p>
        )}
      </header>

      {hasActiveBake && (
        <ResumeBanner
          activeBake={activeBake}
          onStopRequest={() => setStopOpen(true)}
        />
      )}

      <div className="flex flex-col gap-4">
        <HomeCta
          variant={hasActiveBake ? "secondary" : "primary"}
          href="/bake/new"
          icon={<Wheat size={hasActiveBake ? 24 : 28} />}
          label={hasActiveBake ? strings.home.startBakingAlt : strings.home.startBaking}
        />
        <HomeCta
          variant="secondary"
          href="/recipes"
          icon={<BookOpen size={24} />}
          label={strings.home.myRecipes}
          count={recipeCount ?? undefined}
        />
        <HomeCta
          variant="secondary"
          href="/starter"
          icon={<Sprout size={24} />}
          label={strings.home.starterTracker}
        />
      </div>

      {!bakeLoading && !activeBake && <InstallBanner />}

      <StopBakeDialog
        open={stopOpen}
        recipeName={activeBake?.recipe.name ?? ""}
        onConfirm={handleConfirmStop}
        onCancel={() => setStopOpen(false)}
      />
    </main>
  );
}
