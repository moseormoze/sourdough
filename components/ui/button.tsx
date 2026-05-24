import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "soft" | "ghost" | "warn";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-2 focus-visible:ring-ink-2",
  accent: "bg-accent text-paper shadow-cta hover:bg-accent-2 focus-visible:ring-accent-2",
  soft: "bg-paper text-ink shadow-sm hover:bg-bg-2 focus-visible:ring-ink-3",
  ghost: "bg-transparent text-ink-2 hover:bg-bg-2 focus-visible:ring-ink-3",
  warn: "bg-warn text-paper hover:opacity-90 focus-visible:ring-warn",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-cta px-6 text-body-lg font-medium",
  sm: "min-h-touch px-4 text-body font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    iconStart,
    iconEnd,
    className,
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "pressable inline-flex items-center justify-center gap-2 rounded-full",
        "font-ui transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        iconStart && <span aria-hidden>{iconStart}</span>
      )}
      <span>{children}</span>
      {iconEnd && !loading && <span aria-hidden>{iconEnd}</span>}
    </button>
  );
});
