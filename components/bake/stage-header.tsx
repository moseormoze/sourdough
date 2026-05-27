"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProgressStrip } from "./progress-strip";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import type { Stage } from "@/lib/data/stages";

export interface StageHeaderProps {
  stage: Stage;
  totalStages: number;
}

export function StageHeader({ stage, totalStages }: StageHeaderProps) {
  return (
    <header className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/"
          aria-label={strings.bake.stagePlaceholderBackToHome}
          className={cn(
            "pressable inline-flex items-center gap-1 min-h-touch min-w-touch px-2 rounded-full",
            "text-ink-2 hover:bg-bg-2 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3"
          )}
        >
          <ChevronRight size={20} aria-hidden />
        </Link>
        <span dir="ltr" className="num text-tiny font-mono text-ink-3">
          {strings.bake.stageCounter(stage.n, totalStages)}
        </span>
      </div>

      <ProgressStrip total={totalStages} current={stage.n} />

      <div className="mt-4">
        <span className="inline-block bg-accent-bg text-accent text-tiny font-medium px-3 py-1 rounded-full">
          {stage.durationLabel || "—"}
        </span>
        <h1 className="mt-2 text-display-sm text-ink">
          {stage.name}
          {stage.hint && (
            <>
              {" "}
              <span className="text-body text-ink-3" dir="ltr">
                {stage.hint}
              </span>
            </>
          )}
        </h1>
      </div>
    </header>
  );
}
