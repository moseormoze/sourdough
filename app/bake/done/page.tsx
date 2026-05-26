"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { useActiveBake } from "@/lib/hooks/use-active-bake";

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
    abandon();
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
      <header className="relative z-10 flex items-center">
        <button
          type="button"
          onClick={finishBake}
          className={cn(
            "pressable inline-flex items-center gap-2 rounded-full",
            "min-h-touch px-4 text-body font-medium",
            "bg-transparent text-ink-2 hover:bg-bg-2",
            "transition-colors duration-fast ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          )}
        >
          <span aria-hidden>
            <ChevronRight size={20} />
          </span>
          <span>{strings.bake.stagePlaceholderBackToHome}</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-display-md font-display text-ink">{strings.bake.doneTitle}</h1>
        <p className="max-w-xs text-body-lg text-ink-2 leading-relaxed">
          {strings.bake.doneBlurb}
        </p>
        <Button variant="accent" onClick={finishBake} className="mt-2">
          {strings.bake.doneButton}
        </Button>
      </div>
    </main>
  );
}
