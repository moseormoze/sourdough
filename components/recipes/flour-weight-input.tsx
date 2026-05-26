"use client";

import { NumberInput } from "@/components/ui/number-input";
import { strings } from "@/lib/strings";

export interface FlourWeightInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
  onBlur?: () => void;
  error?: string | null;
}

export function FlourWeightInput({ value, onChange, onBlur, error }: FlourWeightInputProps) {
  return (
    <div>
      <NumberInput
        label={strings.form.flourWeight}
        unit="g"
        min={100}
        max={1500}
        step={50}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
      />
      <div className="mt-2 text-tiny text-ink-3 leading-relaxed">
        <div>{strings.form.flourWeightHintMedium}</div>
        <div>{strings.form.flourWeightHintLarge}</div>
      </div>
    </div>
  );
}
