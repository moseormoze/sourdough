"use client";

import { useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

export interface StageKnowledgeTriggerProps {
  onOpen: () => void;
}

interface PointerState {
  startX: number;
  startY: number;
  active: boolean;
  suppressClick: boolean;
}

export function StageKnowledgeTrigger({ onOpen }: StageKnowledgeTriggerProps) {
  const [pressed, setPressed] = useState(false);
  const pointer = useRef<PointerState>({
    startX: 0,
    startY: 0,
    active: false,
    suppressClick: false,
  });

  function beginPress(event: React.PointerEvent<HTMLButtonElement>) {
    pointer.current = {
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      suppressClick: false,
    };
    setPressed(true);
  }

  function movePress(event: React.PointerEvent<HTMLButtonElement>) {
    if (!pointer.current.active) return;
    const dx = Math.abs(event.clientX - pointer.current.startX);
    const dy = Math.abs(event.clientY - pointer.current.startY);
    if (dx <= 5 && dy <= 5) return;
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressed(false);
  }

  function releasePress() {
    pointer.current.active = false;
    setPressed(false);
  }

  function cancelPress() {
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressed(false);
  }

  function activate(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 && pointer.current.suppressClick) {
      pointer.current.suppressClick = false;
      event.preventDefault();
      return;
    }
    pointer.current.suppressClick = false;
    onOpen();
  }

  return (
    <div className="border-t border-line/70">
      <button
        data-manual-press="true"
        type="button"
        onPointerDown={beginPress}
        onPointerMove={movePress}
        onPointerUp={releasePress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onBlur={cancelPress}
        onClick={activate}
        className={cn(
          "flex min-h-touch w-full items-center gap-2 rounded-xl px-2 text-start text-small font-medium text-ink-2",
          "transition-[transform,background-color,color] duration-fast ease-out",
          "hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "motion-reduce:transform-none motion-reduce:transition-colors",
          pressed && "scale-[0.965] bg-ink/[0.06] text-ink",
        )}
      >
        <GraduationCap aria-hidden="true" className="size-5 shrink-0" />
        {strings.bake.stageKnowledge.trigger}
      </button>
    </div>
  );
}
