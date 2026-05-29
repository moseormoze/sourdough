"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { TOTAL_STAGES } from "@/lib/data/stages";
import type { ActiveBake } from "@/lib/types/active-bake";

export interface ResumeBannerProps {
  activeBake: ActiveBake;
  onStopRequest: () => void;
}

export function ResumeBanner({ activeBake, onStopRequest }: ResumeBannerProps) {
  const router = useRouter();

  const inFeedStage = activeBake.feedAt !== null && !activeBake.feedStagePassed;

  function handleContinue() {
    router.push(inFeedStage ? "/bake/feed" : `/bake/stage/${activeBake.currentStage}`);
  }

  const current = activeBake.currentStage;
  const total = TOTAL_STAGES;

  return (
    <aside
      aria-label={strings.bake.resumeBannerLabel}
      className={cn(
        "w-full rounded-2xl bg-accent-bg text-ink",
        "p-5 mb-5 shadow-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-eyebrow uppercase text-accent">
            {strings.bake.resumeBannerLabel}
          </p>
          <p className="mt-1 text-display-sm text-ink truncate">
            {activeBake.recipe.name}
          </p>
          <p className="mt-0.5 text-small text-ink-2">
            {inFeedStage
              ? strings.feedStage.bannerStage
              : strings.bake.resumeBannerStage(current, total)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleContinue}
            className={cn(
              "pressable inline-flex items-center justify-center rounded-full",
              "bg-accent text-paper min-h-touch px-5 text-body font-medium shadow-cta",
              "transition-colors duration-fast ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            )}
          >
            {strings.bake.resumeBannerContinue}
          </button>
          <button
            type="button"
            onClick={onStopRequest}
            className="min-h-touch px-2 text-tiny text-ink-3 hover:text-danger transition-colors"
          >
            {strings.bake.resumeBannerStop}
          </button>
        </div>
      </div>

      <div
        className="mt-4 flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={strings.bake.resumeBannerStage(current, total)}
      >
        {Array.from({ length: total }, (_, i) => {
          const stageNum = i + 1;
          const isFilled = stageNum <= current;
          return (
            <span
              key={stageNum}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-base ease-out",
                isFilled ? "bg-accent" : "bg-accent/20"
              )}
              aria-hidden
            />
          );
        })}
      </div>
    </aside>
  );
}
