"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";

export interface ResumeCardProps {
  activeBake: ActiveBake;
  onAbandonRequest: () => void;
}

export function ResumeCard({ activeBake, onAbandonRequest }: ResumeCardProps) {
  const router = useRouter();

  function handleResume() {
    router.push(`/bake/stage/${activeBake.currentStage}`);
  }

  return (
    <section
      aria-label={strings.bake.resumeHeading}
      className="w-full rounded-2xl bg-paper shadow-sm p-5 flex flex-col gap-4"
    >
      <header>
        <p className="text-eyebrow uppercase text-ink-3">{strings.bake.resumeHeading}</p>
        <h2 className="mt-1 text-display-sm text-ink">{activeBake.recipe.name}</h2>
        <p className="mt-1 text-body text-ink-2">
          {strings.bake.resumeStageMetaUnknown(activeBake.currentStage)}
        </p>
      </header>

      <Button variant="accent" onClick={handleResume}>
        {strings.bake.resumeContinue}
      </Button>
      <button
        type="button"
        onClick={onAbandonRequest}
        className="self-center min-h-touch px-3 text-body text-ink-3 hover:text-danger transition-colors"
      >
        {strings.bake.resumeAbandon}
      </button>
    </section>
  );
}
