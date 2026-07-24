"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TempInput } from "@/components/recipes/temp-input";
import { BakeTimeline } from "./bake-timeline";
import { BakingMethodSelector } from "./baking-method-selector";
import { RatioControl } from "./ratio-control";
import {
  useDateTimePicker,
  startOfDay,
  MAX_HOUR,
} from "@/lib/hooks/use-date-time-picker";
import {
  calculateBakeSteps,
  bakeDurationSecs,
  earliestReadyAt,
  starterPeakSecs,
  RETARD_DEFAULT_SECS,
  RETARD_MIN_SECS,
  RETARD_MAX_SECS,
  DEFAULT_FEED_RATIO,
  type FeedRatio,
} from "@/lib/bake-timing";
import { computePresetSchedule, type PresetKey } from "@/lib/bake-presets";
import { strings } from "@/lib/strings";
import { DEFAULT_BAKING_METHOD, type BakingMethod } from "@/lib/types/baking-method";
import type { Recipe } from "@/lib/types/recipe";

export interface BakePlannerScreenProps {
  recipe: Recipe;
  imageUrl?: string;
  onConfirm: (recipe: Recipe, bakingMethod: BakingMethod, feedAt?: Date, peakAt?: Date, feedRatio?: FeedRatio, retardHours?: number) => void;
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
// PresetChip — a seed shortcut, not a mode. Tap fills the manual controls.
// ---------------------------------------------------------------------------

interface PresetChipProps {
  presetKey: PresetKey;
  name: string;
  selected: boolean;
  onSelect: () => void;
}

function PresetChip({ presetKey, name, selected, onSelect }: PresetChipProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={name}
      data-preset={presetKey}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onClick={onSelect}
      className={`shrink-0 flex items-center rounded-full px-4 min-h-[44px]
        text-body font-medium border
        transition-[transform,background-color,border-color] duration-[120ms] ease-out
        ${isPressed ? "scale-[0.965]" : "scale-100"}
        ${selected
          ? "border-[1.5px] border-accent bg-accent-bg text-accent"
          : "border-line bg-paper text-ink-2"
        }`}
    >
      {name}
    </button>
  );
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

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const starterReady = false; // build step always present — baker always builds levain
  const [temp, setTemp] = useState<number | "">(recipe.kitchenTemp);
  const [bakingMethod, setBakingMethod] = useState<BakingMethod>(DEFAULT_BAKING_METHOD);
  const [retardHours, setRetardHours] = useState(RETARD_DEFAULT_SECS / 3600);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);
  const [direction, setDirection] = useState<"end" | "start">("start");
  const [feedRatio, setFeedRatio] = useState<FeedRatio>(DEFAULT_FEED_RATIO);

  const kitchenTemp = typeof temp === "number" ? temp : recipe.kitchenTemp;
  const retardSecs = retardHours * 3600;

  const minReadyAt = useMemo(
    () =>
      direction === "end"
        ? earliestReadyAt(kitchenTemp, now, starterReady, RETARD_DEFAULT_SECS, recipe.flour, feedRatio)
        : now,
    // feedRatio affects earliestReadyAt only in "end" mode (starter peak secs)
    [direction, kitchenTemp, now, starterReady, recipe.flour, feedRatio],
  );

  const {
    availableDays,
    dayIdx,
    effectiveHour,
    minHour,
    timeLabel,
    handleDaySelect,
    adjustHour,
    setExactTime,
    jumpTo,
    targetAt,
    isValid,
    totalProcessHours,
  } = useDateTimePicker({ minReadyAt, now, allowPast: direction === "start" });

  // Reset to earliest slot when starter readiness changes
  useEffect(() => {
    handleDaySelect(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterReady]);

  // A manual edit means the schedule no longer matches the seeded preset.
  function clearPreset() {
    setSelectedPreset(null);
  }

  function handleDaySelectManual(idx: number) {
    clearPreset();
    handleDaySelect(idx);
  }

  function adjustHourManual(delta: number) {
    clearPreset();
    adjustHour(delta);
  }

  function handleExactTime(value: string) {
    // value is "HH:MM" from the native time input; empty when cleared.
    if (!value) return;
    const [h, m] = value.split(":");
    const hh = Number(h);
    const mm = Number(m);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;
    clearPreset();
    setExactTime(hh, mm);
  }

  function handleDirection(dir: "end" | "start") {
    clearPreset();
    setDirection(dir);
  }

  function handleRatioChange(ratio: FeedRatio) {
    clearPreset();
    setFeedRatio(ratio);
  }

  function handleRetardChange(hours: number) {
    clearPreset();
    setRetardHours(hours);
  }

  // "end" mode: targetAt is desired ready time — apply graceful overflow.
  // "start" mode: targetAt is build-start time — compute readyAt forward
  //   (build duration + full dough sequence).
  const effectiveReadyAt = useMemo(() => {
    if (direction === "start") {
      return new Date(
        targetAt.getTime() +
          (starterPeakSecs(kitchenTemp, feedRatio) +
            bakeDurationSecs(kitchenTemp, retardSecs, recipe.flour)) *
            1000,
      );
    }
    const floorForRetard = earliestReadyAt(kitchenTemp, now, starterReady, retardSecs, recipe.flour, feedRatio);
    return new Date(Math.max(targetAt.getTime(), floorForRetard.getTime()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, targetAt.getTime(), kitchenTemp, now, starterReady, retardSecs, recipe.flour, feedRatio]);

  const pushedLater =
    direction === "end" && effectiveReadyAt.getTime() > targetAt.getTime() + 60_000;

  const steps = useMemo(
    () => calculateBakeSteps(effectiveReadyAt, kitchenTemp, starterReady, retardSecs, recipe.flour, feedRatio),
    [effectiveReadyAt, kitchenTemp, starterReady, retardSecs, recipe.flour, feedRatio],
  );

  const minDateLabel = TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);
  const effectiveLabel = `${TIME_FMT.format(effectiveReadyAt)} · ${dayLabel(effectiveReadyAt, now)}`;
  const startModeTotalHours = Math.round(
    (starterPeakSecs(kitchenTemp, feedRatio) + bakeDurationSecs(kitchenTemp, retardSecs, recipe.flour)) / 3600,
  );

  // Preset selection — seeds the manual controls, forces "end" direction.
  function selectPreset(key: PresetKey) {
    if (selectedPreset === key) {
      setSelectedPreset(null); // tap again to release the seed (values stay)
      return;
    }
    const result = computePresetSchedule(key, now, kitchenTemp, starterReady, recipe.flour);
    setSelectedPreset(key);
    jumpTo(result.readyAt, result.readyAt.getHours(), result.readyAt.getMinutes());
    setDirection("end");
    setRetardHours(result.retardSecs / 3600);
    setFeedRatio(result.feedRatio);
  }

  const ctaEnabled = isValid;

  const PRESET_LIST: { key: PresetKey; name: string }[] = [
    { key: "fast",          name: s.presets.fast.name },
    { key: "classic",       name: s.presets.classic.name },
    { key: "classic-late",  name: s.presets.classicLate.name },
    { key: "long",          name: s.presets.long.name },
  ];

  function handleConfirm() {
    const feedAt = steps.find((step) => step.key === "build")?.startAt;
    const peakAt = steps.find((step) => step.key === "mix")?.startAt;
    onConfirm({ ...recipe, kitchenTemp }, bakingMethod, feedAt, peakAt, feedRatio, retardHours);
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

        {/* Temperature */}
        <div className="mb-2">
          <TempInput label={s.tempQuestion} value={temp} onChange={(v) => setTemp(v)} />
        </div>
        <p className="text-tiny text-ink-3 mb-1">{s.tempHint}</p>
        <p className="text-tiny text-ink-2 mb-6">{s.tempImportantHint}</p>

        <div className="h-px bg-line mb-6" />

        {/* Schedule section — manual is the surface; presets seed it */}
        <section className="mb-6">
          <h2 className="text-heading text-ink mb-1">{s.scheduleSectionTitle}</h2>
          <p className="text-body-sm text-ink-3 mb-4">{s.scheduleSectionSubtitle}</p>

          {/* Preset chips — less-prominent shortcut row */}
          <p className="text-label text-ink-3 mb-2">{s.presetRowLabel}</p>
          <div
            role="radiogroup"
            aria-label={s.presetRowLabel}
            className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 mb-6 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {PRESET_LIST.map(({ key, name }) => (
              <PresetChip
                key={key}
                presetKey={key}
                name={name}
                selected={selectedPreset === key}
                onSelect={() => selectPreset(key)}
              />
            ))}
          </div>

          {/* Direction toggle */}
          <div role="radiogroup" className="flex gap-2 mb-6">
            {(["start", "end"] as const).map((dir) => {
              const label = dir === "end" ? s.directionEnd : s.directionStart;
              const active = direction === dir;
              return (
                <button
                  key={dir}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleDirection(dir)}
                  onPointerDown={() => handleDirection(dir)}
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

          {/* Day + hour picker */}
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
                    data-testid={`day-pill-${idx}`}
                    onClick={() => handleDaySelectManual(idx)}
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
                onClick={() => adjustHourManual(-1)}
                disabled={effectiveHour <= minHour}
                className="pressable min-h-touch min-w-touch flex items-center justify-center
                           text-ink-2 hover:text-ink disabled:opacity-40"
              >
                <span className="text-xl leading-none select-none">−</span>
              </button>
              <input
                type="time"
                value={timeLabel}
                onChange={(e) => handleExactTime(e.target.value)}
                aria-label={s.exactTimeLabel}
                dir="ltr"
                className="flex-1 min-h-touch bg-transparent text-center num font-mono
                           text-body-lg text-ink cursor-pointer
                           transition-transform duration-[120ms] ease-out active:scale-[0.985]
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-inset
                           rounded-md"
              />
              <button
                type="button"
                aria-label="עוד שעה"
                onClick={() => adjustHourManual(1)}
                disabled={effectiveHour >= MAX_HOUR}
                className="pressable min-h-touch min-w-touch flex items-center justify-center
                           text-ink-2 hover:text-ink disabled:opacity-40"
              >
                <span className="text-xl leading-none select-none">+</span>
              </button>
            </div>

            {direction === "start" && (
              <p className="text-tiny text-ink-3">{s.pastHint}</p>
            )}
          </div>

          {/* Ratio control — below the picker so the start time is the anchor */}
          <div className="mb-6">
            <RatioControl value={feedRatio} onChange={handleRatioChange} />
          </div>

          {/* Full timeline — always visible inline, with editable retard */}
          {isValid ? (
            <section className="mb-2">
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
                  onChange: handleRetardChange,
                }}
              />
              {direction === "start" && (
                <p className="text-body-sm text-accent font-medium mt-4" data-testid="ready-result">
                  {s.readyResultLabel(effectiveLabel)}
                </p>
              )}
              {pushedLater && (
                <p className="text-body-sm text-warn mt-4" role="status">
                  {s.retardOverflowNote(effectiveLabel)}
                </p>
              )}
              <p className="text-tiny text-ink-3 mt-4">{s.timelineEstimateNote}</p>
            </section>
          ) : (
            <p className="text-body-sm text-warn mb-2" role="alert">
              {s.tooSoon(minDateLabel)}
            </p>
          )}
        </section>

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
          disabled={!ctaEnabled}
          className="w-full"
        >
          {s.startButton}
        </Button>
      </div>
    </main>
  );
}
