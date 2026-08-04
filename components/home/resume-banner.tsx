"use client";

import Link from "next/link";
import { type Ref } from "react";
import { cn } from "@/lib/cn";
import type { HomeBakeStatus } from "@/lib/home-bake-status";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";
import { HomeBakeStatusView } from "./home-bake-status-view";

export interface ResumeBannerProps {
  recipeName: string;
  stage: { number: number; total: number; name: string };
  status: HomeBakeStatus;
  continueHref: string;
  onStopRequest: () => void;
  stopButtonRef?: Ref<HTMLButtonElement>;
}

export function ResumeBanner({
  recipeName,
  stage,
  status,
  continueHref,
  onStopRequest,
  stopButtonRef,
}: ResumeBannerProps) {
  const continuePress = usePressActivation<HTMLAnchorElement>();
  const stopPress = usePressActivation<HTMLButtonElement>(onStopRequest);

  return (
    <aside
      aria-label={strings.bake.resumeBannerLabel}
      className="rounded-[2rem] bg-[#292A28] p-5 text-paper shadow-[0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(41,42,40,0.22)] max-[340px]:p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="text-small font-medium text-accent-2">
          {strings.bake.resumeBannerLabel}
        </p>
        <span dir="ltr" className="num shrink-0 text-small text-paper/60">
          {strings.bake.stageCounter(stage.number, stage.total)}
        </span>
      </div>

      <h2 className="mt-3 min-w-0 text-display-sm text-paper [overflow-wrap:anywhere]">
        {recipeName}
      </h2>
      <p className="mt-1 min-w-0 text-body text-paper/70 [overflow-wrap:anywhere]">
        {stage.name}
      </p>

      {status.kind !== "none" && (
        <div className="mt-4 rounded-2xl border border-paper/10 bg-paper/[0.06] p-4">
          <HomeBakeStatusView status={status} />
        </div>
      )}

      <div
        className="mt-4 flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={stage.total}
        aria-valuenow={stage.number}
        aria-label={strings.bake.resumeBannerStage(stage.number, stage.total)}
      >
        {Array.from({ length: stage.total }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 min-w-0 flex-1 rounded-full",
              index < stage.number ? "bg-accent" : "bg-paper/15",
            )}
            aria-hidden
          />
        ))}
      </div>

      <Link
        href={continueHref}
        {...continuePress.pressProps}
        data-manual-press="true"
        data-pressed={continuePress.isPressed ? "" : undefined}
        className={cn(
          "mt-5 flex min-h-touch w-full items-center justify-center rounded-full bg-paper px-5 py-3 text-body font-medium text-[#292A28]",
          "transition-[transform,background-color] duration-fast ease-out hover:bg-paper/85",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#292A28] motion-reduce:transform-none",
          continuePress.isPressed && "scale-[0.97] bg-paper/80",
        )}
      >
        {strings.bake.resumeBannerContinue}
      </Link>
      <button
        ref={stopButtonRef}
        type="button"
        {...stopPress.pressProps}
        data-manual-press="true"
        data-pressed={stopPress.isPressed ? "" : undefined}
        className={cn(
          "mt-1 flex min-h-touch w-full items-center justify-center rounded-full px-4 py-2 text-small text-paper/60",
          "transition-[transform,background-color,color] duration-fast ease-out hover:bg-paper/[0.06] hover:text-paper",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 motion-reduce:transform-none",
          stopPress.isPressed && "scale-[0.97] bg-paper/10 text-paper",
        )}
      >
        {strings.bake.resumeBannerStop}
      </button>
    </aside>
  );
}
