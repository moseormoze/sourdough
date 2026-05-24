"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/cn";

export type HomeCtaVariant = "primary" | "secondary";

export interface HomeCtaProps {
  href: string;
  icon: ReactNode;
  label: string;
  count?: number;
  variant?: HomeCtaVariant;
}

const DRAG_CANCEL_THRESHOLD_PX = 5;

export function HomeCta({ href, icon, label, count, variant = "secondary" }: HomeCtaProps) {
  const router = useRouter();
  const pressedRef = useRef(false);
  const [pressed, setPressed] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const isPrimary = variant === "primary";

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
    if (wasPressed) {
      router.push(href);
    }
  }

  function handlePointerCancel() {
    setPressedBoth(false);
    startRef.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  }

  const showCount = count !== undefined && count > 0;

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
      aria-label={showCount ? `${label} · ${count}` : label}
      className={cn(
        "w-full flex items-center gap-4 rounded-2xl text-start",
        "transition-[transform,background-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        isPrimary
          ? "bg-accent text-paper shadow-cta py-6 px-6 min-h-[88px] focus-visible:ring-accent-2"
          : "bg-paper text-ink shadow-sm py-5 px-5 min-h-[72px] focus-visible:ring-ink-3",
        pressed && "scale-[0.985]",
        pressed && isPrimary && "bg-accent/95",
        pressed && !isPrimary && "bg-bg-2"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          isPrimary ? "bg-paper/15 text-paper w-12 h-12" : "bg-accent-bg text-accent w-11 h-11"
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 flex flex-col">
        <span
          className={cn(
            "font-medium",
            isPrimary ? "text-display-sm" : "text-heading"
          )}
        >
          {label}
        </span>
      </span>
      {showCount && (
        <span
          dir="ltr"
          className={cn(
            "rounded-full px-3 py-1 font-mono text-small",
            isPrimary ? "bg-paper/15 text-paper" : "bg-accent-bg text-accent"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
