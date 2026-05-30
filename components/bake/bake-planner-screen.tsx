"use client";

import { useState, useMemo, useEffect } from "react";
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
  addDays,
  MAX_HOUR,
} from "@/lib/hooks/use-date-time-picker";
import {
  calculateBakeSteps,
  bakeDurationSecs,
  earliestReadyAt,
  RETARD_DEFAULT_SECS,
  RETARD_MIN_SECS,
  RETARD_MAX_SECS,
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
// Presets
// ---------------------------------------------------------------------------

interface BakingPreset {
  key: string;
  label: string;
  targetDate: Date;
  targetHour: number;
}

function buildPresets(now: Date, labels: typeof strings.bakeScheduler.presets): BakingPreset[] {
  const setH = (d: Date, h: number): Date => {
    const out = new Date(d);
    out.setHours(h, 0, 0, 0);
    return out;
  };
  const nextWeekday = (wd: number, hour: number): Date => {
    const base = startOfDay(now);
    let diff = (wd - base.getDay() + 7) % 7;
    if (diff === 0 && setH(base, hour) <= now) diff = 7;
    return setH(addDays(base, diff), hour);
  };
  return [
    { key: "tonight",          label: labels.tonight,        targetDate: setH(startOfDay(now), 20),        targetHour: 20 },
    { key: "tomorrow-morning", label: labels.tomorrowMorning, targetDate: setH(addDays(startOfDay(now), 1), 8), targetHour: 8 },
    { key: "friday-evening",   label: labels.fridayEvening,  targetDate: nextWeekday(5, 18),               targetHour: 18 },
    { key: "saturday-morning", label: labels.saturdayMorning, targetDate: nextWeekday(6, 9),               targetHour: 9 },
  ];
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
  const [retardHours, setRetardHours] = useState(RETARD_DEFAULT_SECS / 3600);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [direction, setDirection] = useState<"end" | "start">("end");

  const presets = useMemo(() => buildPresets(now, s.presets), [now, s.presets]);

  const kitchenTemp = typeof temp === "number" ? temp : recipe.kitchenTemp;
  const retardSecs = retardHours * 3600;

  // In "end" mode: floor = earliest the loaf can be ready (backward planning).
  // In "start" mode: floor = now + 30 min (earliest the baker can start levain).
  const minReadyAt = useMemo(
    () =>
      direction === "end"
        ? earliestReadyAt(kitchenTemp, now, starterReady, RETARD_DEFAULT_SECS, recipe.flour)
        : new Date(now.getTime() + 30 * 60 * 1000),
    [direction, kitchenTemp, now, starterReady, recipe.flour],
  );

  const {
    availableDays,
    dayIdx,
    effectiveHour,
    minHour,
    handleDaySelect,
    adjustHour,
    jumpTo,
    targetAt,
    isValid,
    totalProcessHours,
  } = useDateTimePicker({ minReadyAt, now });

  function applyPreset(preset: BakingPreset) {
    jumpTo(preset.targetDate, preset.targetHour);
    setSelectedPreset(preset.key);
  }

  function handleDaySelectAndClear(idx: number) {
    handleDaySelect(idx);
    setSelectedPreset(null);
  }

  function adjustHourAndClear(delta: number) {
    adjustHour(delta);
    setSelectedPreset(null);
  }

  // Reset to the earliest slot when the starter readiness (and thus the floor) changes.
  useEffect(() => {
    handleDaySelect(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterReady]);

  // "end" mode: targetAt is the desired ready time — apply graceful overflow.
  // "start" mode: targetAt is the levain-start time — compute readyAt forward.
  const effectiveReadyAt = useMemo(() => {
    if (direction === "start") {
      return new Date(
        targetAt.getTime() + bakeDurationSecs(kitchenTemp, retardSecs, recipe.flour) * 1000,
      );
    }
    const floorForRetard = earliestReadyAt(kitchenTemp, now, starterReady, retardSecs, recipe.flour);
    return new Date(Math.max(targetAt.getTime(), floorForRetard.getTime()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, targetAt.getTime(), kitchenTemp, now, starterReady, retardSecs, recipe.flour]);

  const pushedLater =
    direction === "end" && effectiveReadyAt.getTime() > targetAt.getTime() + 60_000;

  const steps = useMemo(
    () => calculateBakeSteps(effectiveReadyAt, kitchenTemp, starterReady, retardSecs, recipe.flour),
    [effectiveReadyAt, kitchenTemp, starterReady, retardSecs, recipe.flour],
  );

  const minDateLabel = TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);
  const effectiveLabel = `${TIME_FMT.format(effectiveReadyAt)} · ${dayLabel(effectiveReadyAt, now)}`;
  const startModeTotalHours = Math.round(
    bakeDurationSecs(kitchenTemp, retardSecs, recipe.flour) / 3600,
  );

  function handleConfirm() {
    const feedAt = steps.find((step) => step.key === "feed")?.startAt;
    const peakAt = steps.find((step) => step.key === "levain")?.startAt;
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

        {/* Planning framing */}
        <section className="mb-6">
          <h1 className="text-heading text-ink">{s.planningTitle}</h1>
          <p className="text-body-sm text-ink-3 mt-1">{s.planningSubtitle}</p>
        </section>

        {/* Starter readiness */}
        <section className="mb-6">
          <StarterToggle
            label={s.starterLabel}
            value={starterReady}
            onChange={setStarterReady}
          />
        </section>

        {/* Temperature */}
        <div className="mb-2">
          <TempInput label={s.tempQuestion} value={temp} onChange={(v) => setTemp(v)} />
        </div>
        <p className="text-tiny text-ink-3 mb-1">{s.tempHint}</p>
        <p className="text-tiny text-ink-2 mb-6">{s.tempImportantHint}</p>

        <div className="h-px bg-line mb-6" />

        {/* Presets */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none mb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {presets.map((preset) => {
            const disabled = preset.targetDate < minReadyAt;
            const active = selectedPreset === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                disabled={disabled}
                onClick={() => applyPreset(preset)}
                className={`pressable flex-shrink-0 rounded-full px-4 py-2 text-body-sm font-medium
                  border-[1.5px] transition-colors duration-fast ease-out
                  disabled:opacity-35 disabled:cursor-default
                  ${active
                    ? "border-accent bg-accent-bg text-accent"
                    : "border-line bg-transparent text-ink-2"
                  }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Direction toggle: start vs end */}
        <div role="radiogroup" className="flex gap-2 mb-6">
          {(["end", "start"] as const).map((dir) => {
            const label = dir === "end" ? s.directionEnd : s.directionStart;
            const active = direction === dir;
            return (
              <button
                key={dir}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => { setDirection(dir); setSelectedPreset(null); }}
                onPointerDown={() => { setDirection(dir); setSelectedPreset(null); }}
                className={`pressable flex-1 rounded-lg px-4 py-2.5 text-body font-medium
                  border-[1.5px] transition-colors duration-fast ease-out
                  ${active
                    ? "border-accent bg-accent-bg text-accent"
                    : "border-line bg-transparent text-ink-2"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* The anchor picker */}
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <p className="text-label text-ink-2">
              {direction === "end" ? s.readyQuestion : s.readyQuestionStart}
            </p>
            <p className="text-body-sm text-ink-3 mt-0.5">
              {direction === "end"
                ? s.contextLine(totalProcessHours)
                : s.contextLineStart(startModeTotalHours)}
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
                  onClick={() => handleDaySelectAndClear(idx)}
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
                  <span className="text-xs text-ink-3 whitespace-nowrap">{s.earliest}</span>
                )}
              </div>
            ))}
          </div>

          {/* Hour stepper */}
          <div className="flex items-center rounded-lg bg-paper border-[1.5px] border-line overflow-hidden">
            <button
              type="button"
              aria-label="פחות שעה"
              onClick={() => adjustHourAndClear(-1)}
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
              onClick={() => adjustHourAndClear(1)}
              disabled={effectiveHour >= MAX_HOUR}
              className="pressable min-h-touch min-w-touch flex items-center justify-center
                         text-ink-2 hover:text-ink disabled:opacity-40"
            >
              <span className="text-xl leading-none select-none">+</span>
            </button>
          </div>
        </div>

        {/* Validation message */}
        {!isValid && (
          <p className="text-body-sm text-warn mb-6" role="alert">
            {s.tooSoon(minDateLabel)}
          </p>
        )}

        {/* Timeline — with the inline, bounded retard slider */}
        {isValid && (
          <section className="mb-6">
            <div className="mb-4">
              <h2 className="text-heading text-ink">{s.timelineTitle}</h2>
              <p className="text-body-sm text-ink-3 mt-0.5">{s.timelineSubtitle}</p>
            </div>
            <BakeTimeline
              steps={steps}
              now={now}
              editableRetard={{
                hours: retardHours,
                min: RETARD_MIN_SECS / 3600,
                max: RETARD_MAX_SECS / 3600,
                onChange: setRetardHours,
              }}
            />
            {pushedLater && (
              <p className="text-body-sm text-warn mt-4" role="status">
                {s.retardOverflowNote(effectiveLabel)}
              </p>
            )}
            {direction === "start" && (
              <p className="text-body-sm text-accent font-medium mt-4" data-testid="ready-result">
                {s.readyResultLabel(effectiveLabel)}
              </p>
            )}
            <p className="text-tiny text-ink-3 mt-4">{s.timelineEstimateNote}</p>
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
