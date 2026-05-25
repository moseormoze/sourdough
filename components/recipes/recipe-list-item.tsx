"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Recipe } from "@/lib/types/recipe";

export interface RecipeListItemProps {
  recipe: Recipe;
  onCommitDelete?: (recipe: Recipe) => void;
}

const DRAG_CANCEL_THRESHOLD_PX = 5;
const SWIPE_OPEN_PX = 120;
const SWIPE_RESIST_TO_PX = 180;
const SWIPE_RESIST_FACTOR = 0.3;
const SWIPE_DISTANCE_COMMIT_PX = 60;
const SWIPE_VELOCITY_COMMIT_PX_PER_MS = 0.5;

function applyRubberBand(rawX: number): number {
  if (rawX <= 0) return 0;
  if (rawX <= SWIPE_OPEN_PX) return rawX;
  if (rawX <= SWIPE_RESIST_TO_PX) {
    return SWIPE_OPEN_PX + (rawX - SWIPE_OPEN_PX) * SWIPE_RESIST_FACTOR;
  }
  return SWIPE_OPEN_PX + (SWIPE_RESIST_TO_PX - SWIPE_OPEN_PX) * SWIPE_RESIST_FACTOR;
}

export function summarizeRecipe(recipe: Recipe): string {
  const parts: string[] = [];
  const { flour } = recipe;

  if (flour.white >= 100) parts.push("100% לבן");
  else if (flour.wholeWheat >= 100) parts.push("100% מלא");
  else if (flour.rye >= 100) parts.push("100% שיפון");
  else {
    if (flour.wholeWheat > 0) parts.push(`${flour.wholeWheat}% מלא`);
    else if (flour.rye > 0) parts.push(`${flour.rye}% שיפון`);
    else if (flour.white > 0) parts.push(`${flour.white}% לבן`);
  }

  parts.push(`${recipe.hydration}% הידרציה`);

  if (recipe.inclusions.length > 0) {
    parts.push(`${recipe.inclusions.length} תוספות`);
  }

  return parts.join(" · ");
}

interface DragState {
  startX: number;
  startY: number;
  lastX: number;
  lastT: number;
  dragging: boolean;
  decided: boolean;
}

export function RecipeListItem({ recipe, onCommitDelete }: RecipeListItemProps) {
  const router = useRouter();
  const dragRef = useRef<DragState | null>(null);
  const lastDeltaXRef = useRef(0);
  const lastDtRef = useRef(1);

  const [offset, setOffset] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [pressed, setPressed] = useState(false);

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastT: performance.now(),
      dragging: false,
      decided: false,
    };
    lastDeltaXRef.current = 0;
    lastDtRef.current = 1;
    setPressed(true);
    setSnapping(false);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    const state = dragRef.current;
    if (!state) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (!state.decided) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx < DRAG_CANCEL_THRESHOLD_PX && ady < DRAG_CANCEL_THRESHOLD_PX) return;
      state.decided = true;
      // Vertical-dominant motion → cancel press, allow scroll
      if (ady > adx) {
        dragRef.current = null;
        setPressed(false);
        return;
      }
      state.dragging = true;
      setPressed(false);
    }

    if (!state.dragging) return;

    const now = performance.now();
    lastDeltaXRef.current = e.clientX - state.lastX;
    lastDtRef.current = Math.max(now - state.lastT, 1);
    state.lastX = e.clientX;
    state.lastT = now;

    setOffset(applyRubberBand(dx));
  }

  function handlePointerUp() {
    const state = dragRef.current;
    dragRef.current = null;

    if (!state) {
      setPressed(false);
      return;
    }

    if (!state.dragging) {
      // Treat as tap
      setPressed(false);
      router.push(`/recipes/${recipe.id}/edit`);
      return;
    }

    setPressed(false);
    const distance = state.lastX - state.startX;
    const velocity = lastDeltaXRef.current / lastDtRef.current;

    const shouldCommit =
      distance > SWIPE_DISTANCE_COMMIT_PX || velocity > SWIPE_VELOCITY_COMMIT_PX_PER_MS;

    if (shouldCommit && onCommitDelete) {
      setSnapping(true);
      setOffset(SWIPE_OPEN_PX);
      onCommitDelete(recipe);
    } else {
      setSnapping(true);
      setOffset(0);
    }
  }

  function handlePointerCancel() {
    dragRef.current = null;
    setPressed(false);
    setSnapping(true);
    setOffset(0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/recipes/${recipe.id}/edit`);
    }
  }

  const committed = offset >= SWIPE_OPEN_PX;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className={cn(
          "absolute inset-y-0 end-0 flex items-center justify-end ps-5 pe-6 text-paper",
          "transition-colors duration-fast ease-out",
          committed ? "bg-danger" : "bg-danger/85"
        )}
        style={{ width: SWIPE_RESIST_TO_PX }}
        aria-hidden
      >
        <Trash2 size={20} />
      </div>

      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onKeyDown={handleKeyDown}
        data-recipe-id={recipe.id}
        data-pressed={pressed ? "" : undefined}
        data-offset={offset}
        style={{
          transform: `translateX(${offset}px)`,
          transition: snapping
            ? "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "none",
        }}
        onTransitionEnd={() => setSnapping(false)}
        className={cn(
          "relative block w-full text-start rounded-2xl bg-paper shadow-sm p-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          pressed && "bg-bg-2"
        )}
      >
        <h3 className="text-heading text-ink">{recipe.name}</h3>
        <p className="mt-1 text-small text-ink-2">{summarizeRecipe(recipe)}</p>
      </button>
    </div>
  );
}
