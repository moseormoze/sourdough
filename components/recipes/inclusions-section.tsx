"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { InclusionRow } from "./inclusion-row";
import { strings } from "@/lib/strings";
import type {
  InclusionError,
  InclusionInput,
} from "@/lib/validate-recipe";

export interface InclusionsSectionProps {
  value: InclusionInput[];
  onChange: (next: InclusionInput[]) => void;
  errors?: InclusionError[];
  showErrors?: boolean[];
  onTouchField?: (rowIndex: number, field: "name" | "amountGrams") => void;
}

export function InclusionsSection({
  value,
  onChange,
  errors,
  showErrors,
  onTouchField,
}: InclusionsSectionProps) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const newRowRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusIndex !== null && newRowRef.current) {
      newRowRef.current.focus();
      setFocusIndex(null);
    }
  }, [focusIndex]);

  function handleAdd() {
    const next: InclusionInput[] = [...value, { name: "", amountGrams: "" }];
    onChange(next);
    setFocusIndex(next.length - 1);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleRowChange(index: number, next: InclusionInput) {
    onChange(value.map((row, i) => (i === index ? next : row)));
  }

  function errorFor(index: number): InclusionError | undefined {
    if (!errors || !showErrors) return undefined;
    if (!showErrors[index]) return undefined;
    return errors[index];
  }

  return (
    <section>
      <h2 className="text-heading text-ink mb-3">{strings.form.inclusionsTitle}</h2>

      {value.length > 0 && (
        <div className="flex flex-col gap-3 mb-3">
          {value.map((inc, i) => (
            <InclusionRow
              key={i}
              ref={i === value.length - 1 ? newRowRef : null}
              value={inc}
              onChange={(next) => handleRowChange(i, next)}
              onRemove={() => handleRemove(i)}
              errors={errorFor(i)}
              onBlurField={(field) => onTouchField?.(i, field)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 min-h-touch px-4 rounded-full bg-bg-2 text-ink-2 text-body font-medium hover:bg-line transition-colors"
      >
        <Plus size={16} aria-hidden />
        <span>{strings.form.inclusionsAdd}</span>
      </button>
    </section>
  );
}
