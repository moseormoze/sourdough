import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ValidationMessage } from "./validation-message";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "dir"> {
  label?: string;
  error?: string | null;
  hint?: string;
  type?: "text" | "email" | "date" | "time";
  dir?: "ltr" | "rtl" | "auto";
  /**
   * "outline" is the legacy bordered box (default); "inset" is the
   * redesign-language borderless frosted field (rollout language spec) —
   * screens opt in with their rollout PR so unconverted screens keep the
   * old look.
   */
  appearance?: "outline" | "inset";
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, hint, className, dir, id, type = "text", appearance = "outline", ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  // No dir on text/email: it inherits the page's RTL, so an *empty* field keeps its
  // placeholder on the start (right) edge. dir="auto" resolved from the value, which
  // is empty at first paint → LTR → the hint rendered on the left. Bidi still lays a
  // Latin value (an email) out left-to-right inside the right-aligned field.
  const resolvedDir = dir ?? (type === "date" || type === "time" ? "ltr" : undefined);

  return (
    <div className="block w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label text-ink-2 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        dir={resolvedDir}
        aria-invalid={!!error || undefined}
        aria-describedby={errorId ?? hintId}
        className={cn(
          "block w-full text-body-lg text-ink",
          "min-h-cta px-4",
          "placeholder:text-ink-3",
          "transition-colors duration-fast ease-out",
          "focus:outline-none",
          "disabled:opacity-40 disabled:pointer-events-none",
          appearance === "inset"
            ? "rounded-2xl bg-paper/70 focus:ring-2 focus:ring-ink/20"
            : "rounded-lg bg-paper border-[1.5px] border-line focus:border-ink focus:ring-2 focus:ring-ink/20",
          error &&
            (appearance === "inset"
              ? "ring-2 ring-danger/40 focus:ring-danger/40"
              : "border-danger focus:border-danger focus:ring-danger/20"),
          className
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-small text-ink-3">
          {hint}
        </p>
      )}
      <ValidationMessage id={errorId} message={error} />
    </div>
  );
});
