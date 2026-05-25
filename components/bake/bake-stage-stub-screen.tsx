"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

export interface BakeStageStubScreenProps {
  stageNumber: number;
}

export function BakeStageStubScreen({ stageNumber }: BakeStageStubScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
      <header className="relative z-10 flex items-center">
        <Link
          href="/"
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
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-display-md font-display text-ink">
          {strings.bake.stagePlaceholderTitle(stageNumber)}
        </h1>
        <p className="mt-3 max-w-xs text-body-lg text-ink-2">
          התוכן של השלב יוגדר ב-feature 03 (bake-stages).
        </p>
      </div>
    </main>
  );
}
