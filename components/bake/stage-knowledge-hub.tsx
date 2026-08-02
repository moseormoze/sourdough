"use client";

import { useRef, useState } from "react";
import { BookOpen, CircleHelp, LifeBuoy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import type {
  StageKnowledgeEntrySummary,
  StageKnowledgeKind,
} from "@/lib/data/stage-knowledge";

export interface StageKnowledgeHubProps {
  entries: readonly StageKnowledgeEntrySummary[];
  onOpen: (kind: StageKnowledgeKind) => void;
}

const ICONS: Record<StageKnowledgeEntrySummary["icon"], LucideIcon> = {
  "book-open": BookOpen,
  "circle-help": CircleHelp,
  "life-buoy": LifeBuoy,
};

const ICON_TONES: Record<StageKnowledgeEntrySummary["tone"], string> = {
  accent: "bg-accent-bg text-accent",
  neutral: "bg-bg-2 text-ink-2",
  warn: "bg-warn-bg text-warn",
};

interface PointerState {
  kind: StageKnowledgeKind | null;
  startX: number;
  startY: number;
  active: boolean;
  suppressClick: boolean;
}

export function StageKnowledgeHub({ entries, onOpen }: StageKnowledgeHubProps) {
  const [pressedKind, setPressedKind] = useState<StageKnowledgeKind | null>(null);
  const pointer = useRef<PointerState>({
    kind: null,
    startX: 0,
    startY: 0,
    active: false,
    suppressClick: false,
  });

  function beginPress(event: React.PointerEvent, kind: StageKnowledgeKind) {
    pointer.current = {
      kind,
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      suppressClick: false,
    };
    setPressedKind(kind);
  }

  function movePress(event: React.PointerEvent) {
    if (!pointer.current.active) return;
    const dx = Math.abs(event.clientX - pointer.current.startX);
    const dy = Math.abs(event.clientY - pointer.current.startY);
    if (dx <= 5 && dy <= 5) return;
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressedKind(null);
  }

  function releasePress() {
    pointer.current.active = false;
    setPressedKind(null);
  }

  function cancelPress(kind: StageKnowledgeKind) {
    if (pointer.current.kind !== kind) return;
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setPressedKind(null);
  }

  function activate(event: React.MouseEvent, kind: StageKnowledgeKind) {
    if (event.detail !== 0 && pointer.current.suppressClick) {
      pointer.current.suppressClick = false;
      event.preventDefault();
      return;
    }
    pointer.current.suppressClick = false;
    onOpen(kind);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line/70 bg-paper shadow-sm">
      <h2 className="px-5 pt-5 text-heading text-ink">
        {strings.bake.stageKnowledge.hubTitle}
      </h2>
      <div className="mt-3 divide-y divide-line/70">
        {entries.map((entry) => {
          const Icon = ICONS[entry.icon];
          const isPressed = pressedKind === entry.kind;
          return (
            <button
              key={entry.kind}
              type="button"
              onPointerDown={(event) => beginPress(event, entry.kind)}
              onPointerMove={movePress}
              onPointerUp={releasePress}
              onPointerCancel={() => cancelPress(entry.kind)}
              onPointerLeave={() => cancelPress(entry.kind)}
              onBlur={() => cancelPress(entry.kind)}
              onClick={(event) => activate(event, entry.kind)}
              className={cn(
                "flex min-h-cta w-full items-center gap-3 px-5 py-3 text-start",
                "transition-[transform,background-color] duration-fast ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                "motion-reduce:transform-none motion-reduce:transition-colors",
                isPressed && "scale-[0.965] bg-ink/[0.06]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                  ICON_TONES[entry.tone],
                )}
              >
                <Icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body-lg font-medium text-ink">
                  {entry.label}
                </span>
                <span className="mt-0.5 block text-small text-ink-2">
                  {entry.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
