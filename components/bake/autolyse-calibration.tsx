"use client";

import { Check, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";

const AUTOLYSE_VIDEO_URL = "https://www.youtube.com/shorts/0JzkxDMnDhI";

export interface AutolyseCalibrationProps {
  initialCheck: string;
}

export function AutolyseCalibration({ initialCheck }: AutolyseCalibrationProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLAnchorElement>();
  const copy = strings.bake.stageKnowledge.calibration;

  return (
    <section
      data-testid="autolyse-calibration"
      className="border-t border-ink/[0.08] pt-5"
    >
      <div className="flex items-start gap-2.5 text-body font-medium text-ink">
        <span
          aria-hidden
          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sage-bg text-sage-2"
        >
          <Check size={14} strokeWidth={2.5} />
        </span>
        <p>{initialCheck}</p>
      </div>

      <a
        data-surface="inset"
        href={AUTOLYSE_VIDEO_URL}
        target="_blank"
        rel="noreferrer"
        {...pressProps}
        className={cn(
          "relative mt-4 block w-full overflow-hidden rounded-2xl bg-ink/[0.035] p-4 text-start",
          "transition-[transform,background-color] duration-fast ease-out",
          "hover:bg-ink/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "motion-reduce:transform-none motion-reduce:transition-colors",
          pressed && "scale-[0.985] bg-ink/[0.06]",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#292A28] text-paper"
          >
            <Play size={18} fill="currentColor" />
          </span>
          <span className="grid min-w-0 flex-1 gap-2 text-small leading-relaxed text-ink-2">
            <span>{copy.before}</span>
            <span className="border-t border-ink/[0.08] pt-2 text-ink">{copy.after}</span>
          </span>
        </span>
      </a>

      <p className="mt-3 text-tiny leading-relaxed text-ink-2">{copy.caveat}</p>
    </section>
  );
}
