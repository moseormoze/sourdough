"use client";

import { useEffect, useRef, type UIEvent } from "react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => index * 5);
const ITEM_HEIGHT_PX = 56;
const SCROLL_SETTLE_MS = 100;

interface WheelColumnProps {
  label: string;
  options: readonly number[];
  value: number;
  optionLabel: (value: number) => string;
  onChange: (value: number) => void;
}

function WheelColumn({
  label,
  options,
  value,
  optionLabel,
  onChange,
}: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const selectedIndex = options.indexOf(value);
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollTop = selectedIndex * ITEM_HEIGHT_PX;
    }
  }, [options, value]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    if (scrollTimerRef.current !== null) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const nextIndex = Math.max(
        0,
        Math.min(options.length - 1, Math.round(list.scrollTop / ITEM_HEIGHT_PX))
      );
      const nextValue = options[nextIndex];
      if (nextValue !== undefined && nextValue !== value) onChange(nextValue);
      scrollTimerRef.current = null;
    }, SCROLL_SETTLE_MS);
  }

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-center text-tiny font-medium text-ink-3">{label}</p>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-orientation="vertical"
        onScroll={handleScroll}
        className="relative z-base h-44 snap-y snap-mandatory touch-pan-y overflow-y-auto overscroll-contain py-[3.75rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={optionLabel(option)}
              onClick={() => onChange(option)}
              className={cn(
                "relative z-[2] flex min-h-14 w-full snap-center items-center justify-center rounded-xl px-2 font-mono tabular-nums transition-[color,font-size,opacity,background-color] duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-3 motion-reduce:transition-none",
                selected
                  ? "text-display-sm text-ink opacity-100"
                  : "text-body-lg text-ink-3 opacity-55 hover:bg-ink/[0.04] hover:text-ink-2 hover:opacity-100"
              )}
            >
              <span dir="ltr" className="num">
                {String(option).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DurationWheelProps {
  valueMinutes: number;
  onChange: (minutes: number) => void;
}

export function DurationWheel({ valueMinutes, onChange }: DurationWheelProps) {
  const hours = Math.floor(valueMinutes / 60);
  const minutes = valueMinutes % 60;
  const hoursRef = useRef(hours);
  const minutesRef = useRef(minutes);

  useEffect(() => {
    hoursRef.current = hours;
    minutesRef.current = minutes;
  }, [hours, minutes]);

  function changeHours(nextHours: number) {
    hoursRef.current = nextHours;
    onChange(nextHours * 60 + minutesRef.current);
  }

  function changeMinutes(nextMinutes: number) {
    minutesRef.current = nextMinutes;
    onChange(hoursRef.current * 60 + nextMinutes);
  }

  return (
    <div
      data-testid="autolyse-duration-wheel"
      data-surface="glass"
      className="relative mx-auto max-w-[18rem] overflow-hidden rounded-[1.75rem] border border-paper/55 bg-paper/25 px-4 pt-2 backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-[calc(50%+0.875rem)] z-raised h-14 -translate-y-1/2 rounded-2xl border border-paper/70 bg-paper/80 shadow-sm"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-7 z-raised h-14 bg-gradient-to-b from-paper/60 via-paper/35 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-raised h-14 bg-gradient-to-t from-paper/60 via-paper/35 to-transparent"
      />

      <div className="relative flex items-start gap-3" dir="ltr">
        <WheelColumn
          label={strings.bake.autolyseTimer.hoursLabel}
          options={HOUR_OPTIONS}
          value={hours}
          optionLabel={strings.bake.autolyseTimer.hoursOption}
          onChange={changeHours}
        />
        <span
          aria-hidden
          className="relative z-[3] mt-[5.6rem] font-mono text-display-sm leading-none text-ink"
        >
          :
        </span>
        <WheelColumn
          label={strings.bake.autolyseTimer.minutesLabel}
          options={MINUTE_OPTIONS}
          value={minutes}
          optionLabel={strings.bake.autolyseTimer.durationOption}
          onChange={changeMinutes}
        />
      </div>
    </div>
  );
}
