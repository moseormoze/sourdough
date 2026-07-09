import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ValidationMessage } from "./validation-message";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "dir"> {
  label?: string;
  error?: string | null;
  hint?: string;
  type?: "text" | "email" | "date" | "time";
  dir?: "ltr" | "rtl" | "auto";
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, hint, className, dir, id, type = "text", ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const resolvedDir = dir ?? (type === "date" || type === "time" ? "ltr" : "auto");

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
          "block w-full rounded-lg bg-paper text-body-lg text-ink",
          "min-h-cta px-4",
          "border-[1.5px] border-line",
          "placeholder:text-ink-3",
          "transition-colors duration-fast ease-out",
          "focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20",
          "disabled:opacity-40 disabled:pointer-events-none",
          error && "border-danger focus:border-danger focus:ring-danger/20",
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
