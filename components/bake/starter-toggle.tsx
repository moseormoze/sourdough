"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { StarterPeakSheet } from "./starter-peak-sheet";

export interface StarterToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

interface OptionProps {
  label: string;
  optionValue: boolean;
  selected: boolean;
  onSelect: (value: boolean) => void;
}

function ToggleOption({ label, optionValue, selected, onSelect }: OptionProps) {
  const [isPressed, setIsPressed] = useState(false);

  function handlePointerDown() {
    setIsPressed(true);
  }

  function handlePointerUp() {
    setIsPressed(false);
    onSelect(optionValue);
  }

  function handlePointerLeave() {
    setIsPressed(false);
  }

  function handlePointerCancel() {
    setIsPressed(false);
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      className={cn(
        "flex-1 min-h-touch flex items-center justify-center rounded-2xl px-4",
        "text-body font-medium",
        "border-[1.5px] transition-[transform,background-color,border-color] duration-[120ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
        selected
          ? "border-accent ring-2 ring-accent/20 bg-accent-bg text-accent"
          : "border-line bg-transparent text-ink-2",
      )}
      style={isPressed ? { transform: "scale(0.965)" } : undefined}
    >
      {label}
    </button>
  );
}

export function StarterToggle({ label, value, onChange }: StarterToggleProps) {
  const s = strings.bakeScheduler;
  const sg = strings.starterGate;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <p className="text-label text-ink-2">{label}</p>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative inline-flex items-center gap-1 h-8 px-2 rounded-full
                       bg-accent-bg text-accent text-tiny font-medium
                       transition-[transform,background-color] duration-fast ease-out
                       active:scale-[0.97]
                       before:absolute before:inset-x-[-4px] before:inset-y-[-8px] before:content-['']"
            aria-label={sg.peakInfoAriaLabel}
          >
            <Info size={12} aria-hidden />
            {sg.peakInfoTrigger}
          </button>
        </div>
        <div role="radiogroup" aria-label={label} className="flex gap-2">
          {/* RTL: "כן" (true) appears on the RIGHT — put it first in DOM since dir="rtl" */}
          <ToggleOption
            label={s.starterYes}
            optionValue={true}
            selected={value === true}
            onSelect={onChange}
          />
          <ToggleOption
            label={s.starterNo}
            optionValue={false}
            selected={value === false}
            onSelect={onChange}
          />
        </div>
      </div>
      <StarterPeakSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
