"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BakingMethodSelector } from "./baking-method-selector";
import { NumberInput } from "@/components/ui/number-input";
import { computeBakeQuantities } from "@/lib/bake-math";
import { adjustDurationSeconds, tempAdjustedDurationLabel } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import { DEFAULT_BAKING_METHOD, type BakingMethod } from "@/lib/types/baking-method";
import type { Recipe } from "@/lib/types/recipe";

export interface BakeConfirmSheetProps {
  recipe: Recipe;
  imageUrl?: string;
  onConfirm: (recipe: Recipe, bakingMethod: BakingMethod) => void;
  onEdit: () => void;
  onClose: () => void;
}

// ── Segmented bar timeline ────────────────────────────────────────────────────

interface BarPhase {
  name: string;
  /** Q10-adjusted for kitchenTemp when set; otherwise fixed. */
  tempBaseSecs?: number;
  fixedSecs: number;
  barColor: string; // Tailwind bg-* class
  dotColor: string; // Tailwind bg-* class for legend dot
}

const BAR_PHASES: readonly BarPhase[] = [
  {
    name: "שאור",
    // levain build + autolyse (~1h)
    tempBaseSecs: 10 * 3600,
    fixedSecs: 10 * 3600 + 3600,
    barColor: "bg-amber-200",
    dotColor: "bg-amber-300",
  },
  {
    name: "תסיסה ועיצוב",
    // bulk fermentation + shaping (~40 min)
    tempBaseSecs: 4 * 3600,
    fixedSecs: 4 * 3600 + 40 * 60,
    barColor: "bg-orange-200",
    dotColor: "bg-orange-300",
  },
  {
    name: "לילה",
    fixedSecs: 12 * 3600,
    barColor: "bg-indigo-100",
    dotColor: "bg-indigo-300",
  },
  {
    name: "אפייה",
    // preheat + bake covered + bake uncovered + cooling ≈ 2.5h
    fixedSecs: 150 * 60,
    barColor: "bg-rose-200",
    dotColor: "bg-rose-300",
  },
];

function phaseTotalSecs(phase: BarPhase, temp: number): number {
  if (phase.tempBaseSecs == null) return phase.fixedSecs;
  return adjustDurationSeconds(phase.tempBaseSecs, temp) + (phase.fixedSecs - phase.tempBaseSecs);
}

function secsToLabel(secs: number): string {
  const mins = Math.round(secs / 60);
  if (mins < 90) return `~${mins} ד׳`;
  const h = Math.round(mins / 30) / 2;
  const display = h % 1 === 0 ? Math.round(h) : h;
  return `~${display}ש׳`;
}

function formatTotalTime(secs: number): string {
  const totalHours = secs / 3600;
  if (totalHours < 24) {
    const h = Math.round(totalHours * 2) / 2;
    const display = h % 1 === 0 ? Math.round(h) : h;
    return `כ-${display} שעות`;
  }
  const days = Math.floor(totalHours / 24);
  const remHours = Math.round((totalHours % 24) * 2) / 2;
  const dayWord = days === 1 ? "יום" : "ימים";
  if (remHours === 0) return `כ-${days} ${dayWord}`;
  const hDisplay = remHours % 1 === 0 ? Math.round(remHours) : remHours;
  return `כ-${days} ${dayWord} ו-${hDisplay} שע׳`;
}

function BakeTimeline({ kitchenTemp }: { kitchenTemp: number }) {
  const phases = BAR_PHASES.map((p) => ({
    ...p,
    totalSecs: phaseTotalSecs(p, kitchenTemp),
  }));

  const totalSecs = phases.reduce((s, p) => s + p.totalSecs, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero total time */}
      <div>
        <p className="text-4xl font-black leading-tight tracking-tight text-ink" dir="rtl">
          {formatTotalTime(totalSecs)}
        </p>
        <p className="text-small text-ink-3 mt-1">זמן כולל משוער</p>
      </div>

      {/* Phase pills */}
      <div className="flex flex-wrap gap-2">
        {phases.map((p) => (
          <div
            key={p.name}
            className={`${p.barColor} rounded-full px-3 py-1.5 flex items-center gap-1.5`}
          >
            <span className="text-small font-medium text-ink">{p.name}</span>
            <span className="text-small text-ink-2 tabular-nums">{secsToLabel(p.totalSecs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────

export function BakeConfirmSheet({ recipe, imageUrl, onConfirm, onEdit, onClose }: BakeConfirmSheetProps) {
  const [kitchenTemp, setKitchenTemp] = useState<number | "">(recipe.kitchenTemp);
  const [bakingMethod, setBakingMethod] = useState<BakingMethod>(DEFAULT_BAKING_METHOD);
  const sheetRef = useRef<HTMLDivElement>(null);

  const quantities = useMemo(() => computeBakeQuantities(recipe), [recipe]);
  const resolvedTemp = typeof kitchenTemp === "number" ? kitchenTemp : recipe.kitchenTemp;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  function handleConfirm() {
    const temp = typeof kitchenTemp === "number" ? kitchenTemp : recipe.kitchenTemp;
    onConfirm({ ...recipe, kitchenTemp: temp }, bakingMethod);
  }

  const s = strings.bakeConfirm;
  const f = strings.form;

  return (
    <div
      className="fixed inset-0 z-overlay flex flex-col justify-end"
      role="dialog"
      aria-modal
      aria-label={s.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        style={{ animation: "sheet-fade-in 200ms ease-out both" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative z-10 bg-bg rounded-t-3xl shadow-sheet max-h-[92dvh] flex flex-col outline-none"
        style={{ animation: "sheet-up 260ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-line-2" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pt-3 pb-4">

          {/* Recipe header */}
          <div className="flex items-center gap-3 mb-6">
            {imageUrl && (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <Image src={imageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-tiny text-ink-3 mb-0.5">{s.title}</p>
              <p className="text-body-lg text-ink font-semibold leading-snug truncate">{recipe.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              iconStart={<Pencil size={14} aria-hidden />}
              className="text-ink-2 shrink-0"
            >
              {s.editButton}
            </Button>
          </div>

          {/* Baking method — first */}
          <section className="mb-6">
            <BakingMethodSelector value={bakingMethod} onChange={setBakingMethod} />
          </section>

          <div className="h-px bg-line mb-6" />

          {/* Kitchen temp + live timeline */}
          <section className="mb-6">
            <NumberInput
              label={`${f.kitchenTemp} (°C)`}
              value={kitchenTemp}
              onChange={setKitchenTemp}
              unit="°C"
              min={16}
              max={34}
              step={1}
            />
            <p className="text-tiny text-ink-3 mt-1.5 mb-5">קיץ ~24–27°C · חורף ~17–20°C</p>

            <BakeTimeline kitchenTemp={resolvedTemp} />
          </section>

          <div className="h-px bg-line mb-6" />

          {/* Quantities — read-only list */}
          <section className="mb-2">
            <h3 className="text-eyebrow text-ink-3 uppercase tracking-wider mb-3">{s.quantities}</h3>
            <div className="flex flex-col">
              <QuantityRow label={s.flour} grams={quantities.totalFlourGrams} />
              <QuantityRow label={s.water} grams={quantities.totalWaterGrams} />
              <QuantityRow label={s.levain} grams={quantities.levainTotalGrams} />
              <QuantityRow label={s.salt} grams={quantities.saltGrams} last />
            </div>
          </section>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-line bg-bg">
          <Button variant="accent" onClick={handleConfirm} className="w-full">
            {s.startButton}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuantityRow({ label, grams, last }: { label: string; grams: number; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-line"}`}>
      <span className="text-body text-ink-2">{label}</span>
      <span className="text-label text-ink" dir="ltr">
        <span className="num">{grams}</span>
        <span className="text-ink-3 font-normal">g</span>
      </span>
    </div>
  );
}
