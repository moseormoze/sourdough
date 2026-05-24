"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Wheat } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Preset } from "@/lib/presets";

export interface PresetCardProps {
  preset: Preset;
  onSelect: (preset: Preset) => void;
}

const DRAG_CANCEL_THRESHOLD_PX = 5;

const toneClasses: Record<Preset["tone"], string> = {
  country: "bg-accent-bg text-accent",
  wheat: "bg-warn-bg text-warn",
  rye: "bg-bg-2 text-ink-2",
  white: "bg-paper text-ink-3 border border-line",
  wholedark: "bg-ink text-bg",
  beginner: "bg-sage-bg text-sage-2",
};

export function PresetCard({ preset, onSelect }: PresetCardProps) {
  const pressedRef = useRef(false);
  const [pressed, setPressed] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  function setPressedBoth(value: boolean) {
    pressedRef.current = value;
    setPressed(value);
  }

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    startRef.current = { x: e.clientX, y: e.clientY };
    setPressedBoth(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!pressedRef.current) return;
    const start = startRef.current;
    if (!start) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx > DRAG_CANCEL_THRESHOLD_PX || dy > DRAG_CANCEL_THRESHOLD_PX) {
      setPressedBoth(false);
      startRef.current = null;
    }
  }

  function handlePointerUp() {
    const wasPressed = pressedRef.current;
    setPressedBoth(false);
    startRef.current = null;
    if (wasPressed) onSelect(preset);
  }

  function handlePointerCancel() {
    setPressedBoth(false);
    startRef.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(preset);
    }
  }

  const flourSummary = formatFlourSummary(preset);

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onKeyDown={handleKeyDown}
      data-pressed={pressed ? "" : undefined}
      data-preset-id={preset.id}
      aria-label={preset.name}
      className={cn(
        "w-full text-start rounded-2xl bg-paper shadow-sm overflow-hidden",
        "transition-[transform,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressed && "scale-[0.97] shadow-none"
      )}
    >
      <div
        className={cn(
          "aspect-[4/3] flex items-center justify-center",
          toneClasses[preset.tone]
        )}
        aria-hidden
      >
        <Wheat size={56} strokeWidth={1.5} />
      </div>
      <div className="p-4">
        <h3 className="text-heading text-ink">{preset.name}</h3>
        <p className="mt-1 text-small text-ink-2 line-clamp-2">{preset.blurb}</p>
        <p className="mt-3 text-tiny text-ink-3">
          <span dir="ltr" className="num">
            {preset.data.hydration}%
          </span>{" "}
          הידרציה · {flourSummary}
        </p>
      </div>
    </button>
  );
}

function formatFlourSummary(preset: Preset): string {
  const { white, wholeWheat, rye } = preset.data.flour;
  const parts: string[] = [];
  if (white > 0) parts.push(`${white}% לבן`);
  if (wholeWheat > 0) parts.push(`${wholeWheat}% מלא`);
  if (rye > 0) parts.push(`${rye}% שיפון`);
  return parts.join(" · ");
}
