"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { Wheat } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

export interface ChooserCardProps {
  name: string;
  summary: string;
  imageSrc?: string;
  mine?: boolean;
  onSelect: () => void;
}

const DRAG_CANCEL_THRESHOLD_PX = 5;

function PlaceholderTile(): ReactNode {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-2 text-ink-3">
      <Wheat size={56} strokeWidth={1.5} />
    </div>
  );
}

export function ChooserCard({ name, summary, imageSrc, mine, onSelect }: ChooserCardProps) {
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
    if (wasPressed) onSelect();
  }

  function handlePointerCancel() {
    setPressedBoth(false);
    startRef.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }

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
      data-mine={mine ? "" : undefined}
      aria-label={mine ? `${name} (${strings.bake.myBadge})` : name}
      className={cn(
        "flex flex-col w-full text-start rounded-2xl bg-paper shadow-sm overflow-hidden",
        "transition-[transform,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressed && "scale-[0.97] shadow-none"
      )}
    >
      <div className="relative aspect-[4/3] bg-bg-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover"
            priority={false}
          />
        ) : (
          <PlaceholderTile />
        )}
        {mine && (
          <span className="absolute top-2 start-2 rounded-full bg-ink/85 text-paper text-tiny font-medium px-2 py-1">
            {strings.bake.myBadge}
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-heading text-ink">{name}</h3>
        <p className="mt-1 text-small text-ink-2 line-clamp-2 min-h-[2.9em]">{summary}</p>
      </div>
    </button>
  );
}
