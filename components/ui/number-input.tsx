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
  /**
   * "outline" is the legacy bordered box; "inset" is the redesign-language
   * borderless pill (rollout language spec) — screens opt in with their
   * rollout PR so unconverted screens keep the old look.
   */
  appearance?: "outline" | "inset";
}

/**
 * 32px visual box, 44px hit area via the ::before overlay (ui-playbook §10) — a
 * 44px-*wide* stepper made the field demand more width than a two-up column can
 * give (141px available vs 159px needed at 375px), pushing the sign outside the pill.
 */
const stepperClass =
  "relative shrink-0 w-8 min-h-touch flex items-center justify-center text-ink-2 hover:text-ink disabled:opacity-40 " +
  "before:absolute before:-inset-x-[6px] before:inset-y-0 before:content-['']";

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, unit, error, value, onChange, step = 1, min, max, disabled, className, id, compact = false, appearance = "outline", ...rest },
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
          "flex items-center",
          "transition-colors duration-fast ease-out",
          appearance === "inset"
            ? "rounded-full bg-paper/70 focus-within:ring-2 focus-within:ring-ink/20"
            : "rounded-lg bg-paper border-[1.5px] border-line focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/20",
          error &&
            (appearance === "inset"
              ? "ring-2 ring-danger/40 focus-within:ring-danger/40"
              : "border-danger focus-within:border-danger focus-within:ring-danger/20"),
          disabled && "opacity-40 pointer-events-none"
        )}
      >
        {!compact && (
          <button
            type="button"
            aria-label={strings.common.decrement}
            onClick={() => adjust(-step)}
            disabled={!canDecrement}
            className={stepperClass}
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
            // min-w-0 lets the value shrink instead of forcing the flex row wider
            // than the pill — a number input's intrinsic min-width is several chars
            "flex-1 min-w-0 min-h-cta bg-transparent font-mono text-ink",
            appearance === "inset" ? "text-lg" : "text-body-lg",
            // compact has no steppers framing the value — anchor the number
            // next to the unit so it reads as one token ("13 גרם"), instead
            // of floating centered with a gap between value and unit
            compact ? "text-start" : "text-center",
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
            className={stepperClass}
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      <ValidationMessage id={errorId} message={error} />
    </div>
  );
});
