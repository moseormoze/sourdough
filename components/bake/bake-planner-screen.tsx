"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TempInput } from "@/components/recipes/temp-input";
import { StarterToggle } from "./starter-toggle";
import { BakeTimeline } from "./bake-timeline";
import { BakingMethodSelector } from "./baking-method-selector";
import {
  useDateTimePicker,
  startOfDay,
  MAX_HOUR,
} from "@/lib/hooks/use-date-time-picker";
import {
  bakeDurationSecs,
  calculateMinReadyAt,
  calculateBakeSteps,
  type BakeStep,
} from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import { DEFAULT_BAKING_METHOD, type BakingMethod } from "@/lib/types/baking-method";
import type { Recipe } from "@/lib/types/recipe";

export interface BakePlannerScreenProps {
  recipe: Recipe;
  imageUrl?: string;
  onConfirm: (recipe: Recipe, bakingMethod: BakingMethod, feedAt?: Date, peakAt?: Date) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const DAY_FMT = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function dayLabel(day: Date, today: Date): string {
  const diff = Math.round(
    (startOfDay(day).getTime() - startOfDay(today).getTime()) / 86400000,
  );
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(day);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BakePlannerScreen({
  recipe,
  imageUrl,
  onConfirm,
  onBack,
}: BakePlannerScreenProps) {
  const s = strings.bakeScheduler;

  const now = useMemo(() => new Date(), []);

  const [starterReady, setStarterReady] = useState(true);
  const [temp, setTemp] = useState<number | "">(recipe.kitchenTemp);
  const [bakingMethod, setBakingMethod] = useState<BakingMethod>(DEFAULT_BAKING_METHOD);

  const kitchenTemp = typeof temp === "number" ? temp : recipe.kitchenTemp;

  const minReadyAt = useMemo(() => {
    if (starterReady) {
      return new Date(now.getTime() + bakeDurationSecs(kitchenTemp) * 1000);
    }
    return calculateMinReadyAt(kitchenTemp, now);
  }, [starterReady, kitchenTemp, now]);

  const {
    availableDays,
    dayIdx,
    effectiveHour,
    minHour,
    handleDaySelect,
    adjustHour,
    targetAt,
    isValid,
    totalProcessHours,
  } = useDateTimePicker({ minReadyAt, now });

  const steps = useMemo<BakeStep[] | null>(() => {
    if (!isValid) return null;
    return calculateBakeSteps(targetAt, kitchenTemp, starterReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAt.getTime(), kitchenTemp, starterReady, isValid]);

  const minDateLabel =
    TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);

  function handleConfirm() {
    const feedAt = steps?.find((step) => step.key === "feed")?.startAt;
    const peakAt = steps?.find((step) => step.key === "levain")?.startAt;
    onConfirm({ ...recipe, kitchenTemp }, bakingMethod, feedAt, peakAt);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* Scrollable body */}
      <div className="flex-1 px-5 pt-4 pb-4">
        <header className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            iconStart={<ChevronRight size={20} aria-hidden />}
          >
            {s.backToChooser}
          </Button>
        </header>

        {/* Recipe header */}
        <div className="flex items-center gap-3 mb-6">
          {imageUrl && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <Image src={imageUrl} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-tiny text-ink-3 mb-0.5">{s.headerTitle}</p>
            <p className="text-body-lg text-ink font-semibold leading-snug truncate">
              {recipe.name}
            </p>
          </div>
        </div>

        <div className="h-px bg-line mb-6" />

        {/* Starter readiness */}
        <section className="mb-6">
          <StarterToggle
            label={s.starterLabel}
            value={starterReady}
            onChange={setStarterReady}
          />
        </section>

        <div className="h-px bg-line mb-6" />

        {/* Target bread-ready time */}
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <p className="text-label text-ink-2">{s.readyQuestion}</p>
            <p className="text-body-sm text-ink-3 mt-0.5">
              {s.contextLine(totalProcessHours)}
            </p>
          </div>

          {/* Day pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {availableDays.map((day, idx) => (
              <div
                key={day.toISOString()}
                className="flex-shrink-0 flex flex-col items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => handleDaySelect(idx)}
                  className={`pressable rounded-full px-4 py-2 text-body font-medium
                    border transition-colors duration-fast ease-out
                    ${
                      idx === dayIdx
                        ? "bg-ink text-paper border-ink"
                        : "bg-paper text-ink-2 border-line"
                    }`}
                >
                  {dayLabel(day, now)}
                </button>
                {idx === 0 && (
                  <span className="text-xs text-ink-3 whitespace-nowrap">
                    {s.earliest}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Hour stepper */}
          <div className="flex items-center rounded-lg bg-paper border-[1.5px] border-line overflow-hidden">
            <button
              type="button"
              aria-label="פחות שעה"
              onClick={() => adjustHour(-1)}
              disabled={effectiveHour <= minHour}
              className="pressable min-h-touch min-w-touch flex items-center justify-center
                         text-ink-2 hover:text-ink disabled:opacity-40"
            >
              <span className="text-xl leading-none select-none">−</span>
            </button>
            <div className="flex-1 flex items-center justify-center min-h-touch">
              <span dir="ltr" className="num font-mono text-body-lg text-ink">
                {String(effectiveHour).padStart(2, "0")}:00
              </span>
            </div>
            <button
              type="button"
              aria-label="עוד שעה"
              onClick={() => adjustHour(1)}
              disabled={effectiveHour >= MAX_HOUR}
              className="pressable min-h-touch min-w-touch flex items-center justify-center
                         text-ink-2 hover:text-ink disabled:opacity-40"
            >
              <span className="text-xl leading-none select-none">+</span>
            </button>
          </div>
        </div>

        {/* Temperature */}
        <div className="mb-2">
          <TempInput
            label={s.tempQuestion}
            value={temp}
            onChange={(v) => setTemp(v)}
          />
        </div>
        <p className="text-tiny text-ink-3 mb-6">{s.tempHint}</p>

        {/* Validation message */}
        {!isValid && (
          <p className="text-body-sm text-warn mb-6" role="alert">
            {s.tooSoon(minDateLabel)}
          </p>
        )}

        {/* Timeline */}
        {steps && (
          <section className="mb-6">
            <div className="mb-4">
              <h2 className="text-heading text-ink">{s.timelineTitle}</h2>
              <p className="text-body-sm text-ink-3 mt-0.5">{s.timelineSubtitle}</p>
            </div>
            <BakeTimeline key={targetAt.getTime()} steps={steps} now={now} />
          </section>
        )}

        <div className="h-px bg-line mb-6" />

        {/* Baking method */}
        <section className="mb-2">
          <BakingMethodSelector value={bakingMethod} onChange={setBakingMethod} />
        </section>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-line bg-bg/95 backdrop-blur-sm">
        <Button
          variant="accent"
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full"
        >
          {s.startButton}
        </Button>
      </div>
    </main>
  );
}
