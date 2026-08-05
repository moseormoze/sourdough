"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AMBIENT_CANVAS } from "@/components/ui/ambient";
import { strings } from "@/lib/strings";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { track } from "@/lib/analytics/track";

export default function Page() {
  const router = useRouter();
  const { activeBake, loading, abandon } = useActiveBake();

  useEffect(() => {
    if (loading) return;
    if (!activeBake) {
      router.replace("/");
    }
  }, [loading, activeBake, router]);

  if (loading || !activeBake) return null;

  function finishBake() {
    if (activeBake) {
      const durationMinutes = Math.round((Date.now() - activeBake.startedAt) / 60000);
      track("bake_completed", {
        recipeName: activeBake.recipe.name,
        bakingMethod: activeBake.bakingMethod,
        durationMinutes,
      });
    }
    abandon();
    router.push("/");
  }

  return (
    <div className={`min-h-dvh ${AMBIENT_CANVAS}`}>
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] max-[340px]:px-4">
      <header className="relative z-10 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={finishBake}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.bake.stagePlaceholderBackToHome}
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-display-md font-display text-ink">{strings.bake.doneTitle}</h1>
        <p className="max-w-xs text-body-lg text-ink-2 leading-relaxed">
          {strings.bake.doneBlurb}
        </p>
        <Button variant="primary" onClick={finishBake} className="mt-2">
          {strings.bake.doneButton}
        </Button>
      </div>
    </main>
    </div>
  );
}
