"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Recipe } from "@/lib/types/recipe";

export interface RecipeListItemProps {
  recipe: Recipe;
}

const DRAG_CANCEL_THRESHOLD_PX = 5;

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

export function RecipeListItem({ recipe }: RecipeListItemProps) {
  const router = useRouter();
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
    if (wasPressed) {
      router.push(`/recipes/${recipe.id}/edit`);
    }
  }

  function handlePointerCancel() {
    setPressedBoth(false);
    startRef.current = null;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/recipes/${recipe.id}/edit`);
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
      data-recipe-id={recipe.id}
      data-pressed={pressed ? "" : undefined}
      className={cn(
        "block w-full text-start rounded-2xl bg-paper shadow-sm p-4",
        "transition-[transform,background-color] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressed && "scale-[0.985] bg-bg-2"
      )}
    >
      <h3 className="text-heading text-ink">{recipe.name}</h3>
      <p className="mt-1 text-small text-ink-2">{summarizeRecipe(recipe)}</p>
    </button>
  );
}
