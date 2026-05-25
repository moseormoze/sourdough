import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { ValidationMessage } from "./validation-message";
import { strings } from "@/lib/strings";

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "step" | "min" | "max"> {
  label?: string;
  unit?: string;
  error?: string | null;
  value: number | "";
  onChange: (value: number | "") => void;
  step?: number;
  min?: number;
  max?: number;
  /** Hide the −/+ steppers (input + unit only). For tight columns. */
  compact?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, unit, error, value, onChange, step = 1, min, max, disabled, className, id, compact = false, ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;

  const clampedValue: number | "" = value;
  const numericValue = typeof clampedValue === "number" ? clampedValue : null;

  function adjust(delta: number) {
    const next = (numericValue ?? 0) + delta;
    const clamped =
      min !== undefined && next < min
        ? min
        : max !== undefined && next > max
          ? max
          : next;
    onChange(clamped);
  }

  function handleInput(rawValue: string) {
    if (rawValue === "") {
      onChange("");
      return;
    }
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) onChange(parsed);
  }

  const canDecrement = !disabled && (min === undefined || (numericValue ?? min) > min);
  const canIncrement = !disabled && (max === undefined || (numericValue ?? max) < max);

  return (
    <div className="block w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label text-ink-2 mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center rounded-lg bg-paper",
          "border-[1.5px] border-line",
          "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/20",
          "transition-colors duration-fast ease-out",
          error && "border-danger focus-within:border-danger focus-within:ring-danger/20",
          disabled && "opacity-40 pointer-events-none"
        )}
      >
        {!compact && (
          <button
            type="button"
            aria-label={strings.common.decrement}
            onClick={() => adjust(-step)}
            disabled={!canDecrement}
            className="min-h-touch min-w-touch flex items-center justify-center text-ink-2 hover:text-ink disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
        )}
        <input
          ref={ref}
          id={inputId}
          type="number"
          inputMode="decimal"
          dir="ltr"
          value={clampedValue === "" ? "" : clampedValue}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={errorId}
          onChange={(e) => handleInput(e.target.value)}
          className={cn(
            "flex-1 min-h-cta bg-transparent text-center font-mono text-body-lg text-ink",
            "focus:outline-none",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          {...rest}
        />
        {unit && (
          <span dir="ltr" className="ps-2 pe-3 text-ink-3 text-body select-none">
            {unit}
          </span>
        )}
        {!compact && (
          <button
            type="button"
            aria-label={strings.common.increment}
            onClick={() => adjust(step)}
            disabled={!canIncrement}
            className="min-h-touch min-w-touch flex items-center justify-center text-ink-2 hover:text-ink disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      <ValidationMessage id={errorId} message={error} />
    </div>
  );
});
