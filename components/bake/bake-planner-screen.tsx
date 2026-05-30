"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
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
import { computePresetSchedule, type PresetKey } from "@/lib/bake-presets";
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
// Schedule mode
// ---------------------------------------------------------------------------

type ScheduleMode =
  | { kind: "none" }
  | { kind: "preset"; key: PresetKey }
  | { kind: "manual" };

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
// PresetCard
// ---------------------------------------------------------------------------

interface PresetCardProps {
  presetKey: PresetKey;
  name: string;
  hint: string;
  readyLabel: string | null;
  isSelected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

function PresetCard({ presetKey, name, hint, readyLabel, isSelected, onSelect, children }: PresetCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const justFinished = useRef(false);

  function handlePointerDown() {
    setIsPressed(true);
  }

  function handlePointerUp() {
    setIsPressed(false);
  }

  function handleClick() {
    if (justFinished.current) return;
    onSelect();
    justFinished.current = true;
    setTimeout(() => { justFinished.current = false; }, 200);
  }

  const scale = isPressed
    ? (isSelected ? "scale-[0.985]" : "scale-[0.965]")
    : "scale-100";

  const borderClass = isSelected
    ? "border-accent border-[1.5px]"
    : "border-line border";

  const bgClass = isSelected ? "bg-accent-bg" : "bg-paper";

  return (
    <div>
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        aria-label={name}
        data-preset={presetKey}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        className={`w-full text-start rounded-xl px-4 py-3.5 min-h-[64px]
          ${borderClass} ${bgClass}
          transition-[transform,background-color,border-color] duration-[120ms] ease-out
          ${scale}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`text-body font-semibold leading-snug ${isSelected ? "text-accent" : "text-ink"}`}>
            {name}
          </span>
          {readyLabel && (
            <span className={`text-label font-semibold num shrink-0 ${isSelected ? "text-accent" : "text-ink-3"}`} dir="ltr">
              {readyLabel}
            </span>
          )}
        </div>
        <p className="text-body-sm text-ink-2 mt-0.5">{hint}</p>
      </button>

      {/* Inline timeline expansion below selected card */}
      <div
        style={{
          maxHeight: isSelected ? "1200px" : "0px",
          overflow: "hidden",
          transition: isSelected
            ? "max-height 250ms ease-in-out"
            : "max-height 200ms ease-in",
        }}
      >
        <div
          style={{
            opacity: isSelected ? 1 : 0,
            transition: isSelected
              ? "opacity 200ms ease-out 50ms"
              : "opacity 50ms ease-in",
          }}
          className="pt-4"
        >
          {children}
        </div>
      </div>
    </div>
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

  const now = useMemo(() => new Date(), []);

  const [starterReady, setStarterReady] = useState(true);
  const [temp, setTemp] = useState<number | "">(recipe.kitchenTemp);
  const [bakingMethod, setBakingMethod] = useState<BakingMethod>(DEFAULT_BAKING_METHOD);
  const [retardHours, setRetardHours] = useState(RETARD_DEFAULT_SECS / 3600);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>({ kind: "none" });
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [direction, setDirection] = useState<"end" | "start">("end");

  const kitchenTemp = typeof temp === "number" ? temp : recipe.kitchenTemp;
  const retardSecs = retardHours * 3600;

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

  function handleDaySelectAndClear(idx: number) {
    handleDaySelect(idx);
  }

  function adjustHourAndClear(delta: number) {
    adjustHour(delta);
  }

  // Reset to earliest slot when starter readiness changes
  useEffect(() => {
    handleDaySelect(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterReady]);

  // "end" mode: targetAt is desired ready time — apply graceful overflow.
  // "start" mode: targetAt is levain-start time — compute readyAt forward.
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

  // Preset selection
  function selectPreset(key: PresetKey) {
    const result = computePresetSchedule(key, now, kitchenTemp, starterReady, recipe.flour);
    setScheduleMode({ kind: "preset", key });
    setIsManualOpen(false);
    jumpTo(result.readyAt, result.readyAt.getHours());
    setDirection("end");
    setRetardHours(result.retardSecs / 3600);
  }

  function openManual() {
    setIsManualOpen(true);
    setScheduleMode({ kind: "manual" });
  }

  function closeManual() {
    setIsManualOpen(false);
    setScheduleMode({ kind: "none" });
  }

  const ctaEnabled =
    scheduleMode.kind === "preset" ||
    (scheduleMode.kind === "manual" && isValid);

  const PRESET_LIST: { key: PresetKey; name: string; hint: string }[] = [
    { key: "fast",          name: s.presets.fast.name,        hint: s.presets.fast.hint },
    { key: "classic",       name: s.presets.classic.name,     hint: s.presets.classic.hint },
    { key: "classic-late",  name: s.presets.classicLate.name, hint: s.presets.classicLate.hint },
    { key: "long",          name: s.presets.long.name,        hint: s.presets.long.hint },
  ];

  function presetReadyLabel(key: PresetKey): string | null {
    if (scheduleMode.kind !== "preset" || scheduleMode.key !== key) return null;
    const day = dayLabel(effectiveReadyAt, now);
    const time = TIME_FMT.format(effectiveReadyAt);
    return s.presetReadyLabel(day, time);
  }

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

        {/* Schedule section */}
        <section className="mb-6">
          <h2 className="text-heading text-ink mb-1">{s.scheduleSectionTitle}</h2>
          <p className="text-body-sm text-ink-3 mb-4">{s.scheduleSectionSubtitle}</p>

          <div className="flex flex-col gap-3" role="radiogroup" aria-label={s.scheduleSectionTitle}>
            {PRESET_LIST.map(({ key, name, hint }) => {
              const isSelected = scheduleMode.kind === "preset" && scheduleMode.key === key;
              return (
                <PresetCard
                  key={key}
                  presetKey={key}
                  name={name}
                  hint={hint}
                  readyLabel={presetReadyLabel(key)}
                  isSelected={isSelected}
                  onSelect={() => selectPreset(key)}
                >
                  {isSelected && (
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
                  )}
                </PresetCard>
              );
            })}
          </div>

          {/* Advanced disclosure */}
          <div className="mt-3">
            <button
              type="button"
              onClick={isManualOpen ? closeManual : openManual}
              className="pressable w-full flex items-center justify-between
                         min-h-touch px-4 rounded-xl border border-line
                         text-body text-ink-2 transition-colors duration-fast"
            >
              <span>{isManualOpen ? s.advancedDisclosureClose : s.advancedDisclosureOpen}</span>
              <ChevronDown
                size={18}
                aria-hidden
                style={{
                  transform: isManualOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease-out",
                }}
              />
            </button>

            {/* Disclosure content */}
            <div
              style={{
                maxHeight: isManualOpen ? "2000px" : "0px",
                overflow: "hidden",
                transition: isManualOpen
                  ? "max-height 250ms ease-in-out"
                  : "max-height 200ms ease-in",
              }}
            >
              <div
                style={{
                  opacity: isManualOpen ? 1 : 0,
                  transition: isManualOpen
                    ? "opacity 200ms ease-out 50ms"
                    : "opacity 50ms ease-in",
                }}
                className="pt-4"
              >
                {/* Direction toggle */}
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
                        onClick={() => setDirection(dir)}
                        onPointerDown={() => setDirection(dir)}
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

                {/* Manual timeline — only mounted when disclosure is open */}
                {isManualOpen && isValid && (
                  <section className="mb-4">
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
              </div>
            </div>
          </div>
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
