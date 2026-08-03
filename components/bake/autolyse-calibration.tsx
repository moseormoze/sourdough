"use client";

import { useRef, useState } from "react";
import { Check, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

const AUTOLYSE_VIDEO_URL = "https://www.youtube.com/shorts/0JzkxDMnDhI";

export interface AutolyseCalibrationProps {
  initialCheck: string;
}

interface PointerState {
  startX: number;
  startY: number;
  active: boolean;
  suppressClick: boolean;
}

export function AutolyseCalibration({ initialCheck }: AutolyseCalibrationProps) {
  const [pressed, setPressed] = useState(false);
  const pointer = useRef<PointerState>({
    startX: 0,
    startY: 0,
    active: false,
    suppressClick: false,
  });
  const copy = strings.bake.stageKnowledge.calibration;

  function beginPress(event: React.PointerEvent<HTMLAnchorElement>) {
    pointer.current = {
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      suppressClick: false,
    };
    setPressed(true);
  }

  function movePress(event: React.PointerEvent<HTMLAnchorElement>) {
    if (!pointer.current.active) return;
    const dx = Math.abs(event.clientX - pointer.current.startX);
    const dy = Math.abs(event.clientY - pointer.current.startY);
    if (dx <= 5 && dy <= 5) return;
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressed(false);
  }

  function cancelPress() {
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressed(false);
  }

  function releasePress() {
    pointer.current.active = false;
    setPressed(false);
  }

  function activate(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.detail !== 0 && pointer.current.suppressClick) {
      pointer.current.suppressClick = false;
      event.preventDefault();
      return;
    }
    pointer.current.suppressClick = false;
  }

  return (
    <section
      data-testid="autolyse-calibration"
      className="border-t border-line/70 pt-5"
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
        onPointerDown={beginPress}
        onPointerMove={movePress}
        onPointerUp={releasePress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onBlur={cancelPress}
        onClick={activate}
        className={cn(
          "relative mt-4 block w-full overflow-hidden rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-4 text-start",
          "transition-[transform,background-color] duration-fast ease-out",
          "hover:bg-ink/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "motion-reduce:transform-none motion-reduce:transition-colors",
          pressed && "scale-[0.985] bg-ink/[0.06]",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#292A28] text-paper shadow-sm"
          >
            <Play size={18} fill="currentColor" />
          </span>
          <span className="grid min-w-0 flex-1 gap-2 text-small leading-relaxed text-ink-2">
            <span>{copy.before}</span>
            <span className="border-t border-line/70 pt-2 text-ink">{copy.after}</span>
          </span>
        </span>
      </a>

      <p className="mt-3 text-tiny leading-relaxed text-ink-2">{copy.caveat}</p>
    </section>
  );
}
