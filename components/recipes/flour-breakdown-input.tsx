"use client";

import { NumberInput } from "@/components/ui/number-input";
import { ValidationMessage } from "@/components/ui/validation-message";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { flourTotal, type RecipeFormValues } from "@/lib/validate-recipe";

type Flour = RecipeFormValues["flour"];
type FlourKey = keyof Flour;

export interface FlourBreakdownInputProps {
  value: Flour;
  onChange: (next: Flour) => void;
  onBlurField?: (key: FlourKey) => void;
  error?: string | null;
}

const KEYS = ["white", "wholeWheat", "rye", "speltWhite", "speltWhole"] as const;

const LABEL: Record<(typeof KEYS)[number], string> = {
  white: strings.form.flourWhite,
  wholeWheat: strings.form.flourWholeWheat,
  rye: strings.form.flourRye,
  speltWhite: strings.form.flourSpeltWhite,
  speltWhole: strings.form.flourSpeltWhole,
};

export function FlourBreakdownInput({
  value,
  onChange,
  onBlurField,
  error,
}: FlourBreakdownInputProps) {
  const total = flourTotal(value);
  const isOk = Math.abs(total - 100) < 0.01;
  const isOver = total > 100;
  const diff = Math.abs(total - 100);

  function handleField(key: FlourKey, next: number | "") {
    onChange({ ...value, [key]: next });
  }

  return (
    <div>
      <p className="text-label text-ink-2 mb-3">{strings.form.flourBreakdownTitle}</p>
      <div className="grid grid-cols-2 gap-3">
        {KEYS.map((key) => (
          <NumberInput
            key={key}
            label={LABEL[key]}
            unit="%"
            min={0}
            max={100}
            step={5}
            value={value[key]}
            onChange={(v) => handleField(key, v)}
            onBlur={() => onBlurField?.(key)}
          />
        ))}
      </div>

      <p
        className={cn(
          "mt-3 text-small",
          isOk ? "text-sage-2" : "text-danger"
        )}
        aria-live="polite"
      >
        {strings.form.flourSumOk}
        <span dir="ltr" className="num font-mono">
          {total.toFixed(0)}%
        </span>
        {!isOk && (
          <>
            {" · "}
            {isOver ? strings.form.flourSumOver : strings.form.flourSumShort}{" "}
            <span dir="ltr" className="num font-mono">
              {diff.toFixed(0)}%
            </span>
          </>
        )}
        {isOk && <span aria-hidden> ✓</span>}
      </p>

      <ValidationMessage message={error} />
    </div>
  );
}
