"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Wheat, BookOpen, Sprout } from "lucide-react";
import { HomeCta } from "./home-cta";
import { HomeLoadingState } from "./home-loading-state";
import { HomeNavGroup } from "./home-nav-group";
import { ResumeBanner } from "./resume-banner";
import { InstallBanner } from "@/components/onboarding/install-banner";
import { StopBakeDialog } from "@/components/bake/stop-bake-dialog";
import { AMBIENT_CANVAS } from "@/components/ui/ambient";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { listRecipes } from "@/lib/storage/recipes";
import { strings } from "@/lib/strings";
import { track } from "@/lib/analytics/track";
import { getStage, TOTAL_STAGES } from "@/lib/data/stages";
import { getHomeBakeStatus, type HomeBakeStatus } from "@/lib/home-bake-status";

export function HomeScreen() {
  const { activeBake, loading: bakeLoading, abandon } = useActiveBake();
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [stopOpen, setStopOpen] = useState(false);
  const [stopRecipeName, setStopRecipeName] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const startRef = useRef<HTMLAnchorElement>(null);
  const stopRef = useRef<HTMLButtonElement>(null);
  const focusAfterStopRef = useRef<"start" | "stop" | null>(null);

  useEffect(() => {
    setRecipeCount(listRecipes().length);
  }, [activeBake?.id]);

  const activeStage = activeBake ? getStage(activeBake.currentStage) : null;
  const status: HomeBakeStatus = activeBake && activeStage
    ? getHomeBakeStatus(activeBake, activeStage, nowMs)
    : { kind: "none" };
  const timerRunning = status.kind === "timer" && status.phase === "running";

  useEffect(() => {
    if (!timerRunning) return;
    setNowMs(Date.now());
    const interval = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [
    activeBake?.id,
    activeBake?.timerDurationSeconds,
    activeBake?.timerElapsedSeconds,
    activeBake?.timerStartedAt,
    timerRunning,
  ]);

  const handleAfterStopClose = useCallback(() => {
    const target = focusAfterStopRef.current;
    focusAfterStopRef.current = null;
    if (target === "start") startRef.current?.focus();
    if (target === "stop") stopRef.current?.focus();
  }, []);

  function handleStopRequest() {
    if (!activeBake) return;
    setStopRecipeName(activeBake.recipe.name);
    setStopOpen(true);
  }

  function handleConfirmStop() {
    if (activeBake) {
      track("bake_abandoned", {
        atStage: activeBake.currentStage,
        recipeName: activeBake.recipe.name,
      });
    }
    focusAfterStopRef.current = "start";
    setStopOpen(false);
    abandon();
  }

  function handleCancelStop() {
    focusAfterStopRef.current = "stop";
    setStopOpen(false);
  }

  const resolved = !bakeLoading && recipeCount !== null;
  const hasActiveBake = resolved && activeBake !== null && activeStage !== null;

  return (
    <div className={`min-h-dvh ${AMBIENT_CANVAS}`}>
    <main
      aria-busy={!resolved}
      className="relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-[calc(9.25rem+env(safe-area-inset-bottom))] max-[340px]:px-4"
    >
      <header className="mb-5 text-center">
        <h1 className="sr-only">{strings.home.wordmark}</h1>
        <Image
          src="/logo.svg"
          alt=""
          width={96}
          height={96}
          priority
          className="mx-auto size-24"
        />
        {resolved && !hasActiveBake && (
          <p className="mt-2 text-body-lg text-ink-2">{strings.home.subtitle}</p>
        )}
      </header>

      {!resolved && <HomeLoadingState />}

      {hasActiveBake && activeBake && activeStage && (
        <ResumeBanner
          recipeName={activeBake.recipe.name}
          stage={{ number: activeStage.n, total: TOTAL_STAGES, name: activeStage.name }}
          status={status}
          continueHref={`/bake/stage/${activeStage.n}`}
          onStopRequest={handleStopRequest}
          stopButtonRef={stopRef}
        />
      )}

      {resolved && (
        <div
          className={hasActiveBake
            ? "mt-4 grid gap-4 max-[340px]:gap-3"
            : "grid gap-4 max-[340px]:gap-3"}
        >
          {!hasActiveBake && (
            <HomeCta
              ref={startRef}
              variant="focus"
              href="/bake/new"
              icon={<Wheat size={28} />}
              label={strings.home.startBaking}
            />
          )}
          <HomeNavGroup>
            {hasActiveBake && (
              <HomeCta
                ref={startRef}
                variant="nav-row"
                href="/bake/new"
                icon={<Wheat size={24} />}
                label={strings.home.startBakingAlt}
              />
            )}
            <HomeCta
              variant="nav-row"
              href="/recipes"
              icon={<BookOpen size={24} />}
              label={strings.home.myRecipes}
              count={recipeCount > 0 ? recipeCount : undefined}
            />
            <HomeCta
              variant="nav-row"
              href="/starter"
              icon={<Sprout size={24} />}
              label={strings.home.starterTracker}
            />
          </HomeNavGroup>

          {!hasActiveBake && <InstallBanner appearance="home" />}
        </div>
      )}

      <StopBakeDialog
        open={stopOpen}
        appearance="ambient"
        recipeName={stopRecipeName}
        onConfirm={handleConfirmStop}
        onCancel={handleCancelStop}
        onAfterClose={handleAfterStopClose}
      />
    </main>
    </div>
  );
}
