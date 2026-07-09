"use client";

import { NumberInput } from "@/components/ui/number-input";
import { strings } from "@/lib/strings";

export interface FeedingGrams {
  starterGrams: number | "";
  flourGrams: number | "";
  waterGrams: number | "";
}

export interface FeedingGramsInputProps {
  value: FeedingGrams;
  onChange: (next: FeedingGrams) => void;
}

const KEYS = ["starterGrams", "flourGrams", "waterGrams"] as const;

const LABEL: Record<(typeof KEYS)[number], string> = {
  starterGrams: strings.starterTracker.grams.starterLabel,
  flourGrams: strings.starterTracker.grams.flourLabel,
  waterGrams: strings.starterTracker.grams.waterLabel,
};

export function FeedingGramsInput({ value, onChange }: FeedingGramsInputProps) {
  function handleField(key: (typeof KEYS)[number], next: number | "") {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => (
        <NumberInput
          key={key}
          label={LABEL[key]}
          unit={strings.starterTracker.grams.unit}
          min={0}
          value={value[key]}
          onChange={(v) => handleField(key, v)}
        />
      ))}
    </div>
  );
}
