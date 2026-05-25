"use client";

import { forwardRef } from "react";
import { Trash2 } from "lucide-react";
import { TextInput } from "@/components/ui/text-input";
import { NumberInput } from "@/components/ui/number-input";
import { strings } from "@/lib/strings";
import type { InclusionError, InclusionInput } from "@/lib/validate-recipe";

export interface InclusionRowProps {
  value: InclusionInput;
  onChange: (next: InclusionInput) => void;
  onRemove: () => void;
  errors?: InclusionError;
  onBlurField?: (field: "name" | "amountGrams") => void;
}

export const InclusionRow = forwardRef<HTMLInputElement, InclusionRowProps>(function InclusionRow(
  { value, onChange, onRemove, errors, onBlurField },
  ref
) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <TextInput
          ref={ref}
          label={strings.form.inclusionName}
          placeholder={strings.form.inclusionNamePlaceholder}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          onBlur={() => onBlurField?.("name")}
          error={errors?.name ?? null}
        />
      </div>
      <div className="w-32">
        <NumberInput
          label={strings.form.inclusionAmount}
          unit={strings.form.unitGrams}
          step={5}
          min={0}
          value={value.amountGrams}
          onChange={(v) => onChange({ ...value, amountGrams: v })}
          onBlur={() => onBlurField?.("amountGrams")}
          error={errors?.amountGrams ?? null}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${strings.common.delete} ${value.name || strings.form.inclusionName}`}
        className="min-h-touch min-w-touch flex items-center justify-center text-ink-3 hover:text-danger mt-7"
      >
        <Trash2 size={18} aria-hidden />
      </button>
    </div>
  );
});
