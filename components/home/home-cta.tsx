"use client";

import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";

export type HomeCtaVariant = "focus" | "nav-row";

export interface HomeCtaProps {
  href: string;
  icon: ReactNode;
  label: string;
  count?: number;
  variant: HomeCtaVariant;
}

export const HomeCta = forwardRef<HTMLAnchorElement, HomeCtaProps>(function HomeCta(
  { href, icon, label, count, variant },
  ref,
) {
  const { isPressed, pressProps } = usePressActivation<HTMLAnchorElement>();
  const showCount = count !== undefined && count > 0;
  const isFocus = variant === "focus";

  return (
    <Link
      ref={ref}
      href={href}
      {...pressProps}
      data-manual-press="true"
      data-pressed={isPressed ? "" : undefined}
      data-variant={variant}
      aria-label={showCount ? `${label} · ${count}` : label}
      className={cn(
        "relative flex w-full items-center text-start",
        "transition-[transform,background-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2",
        "motion-reduce:transform-none",
        isFocus
          ? "min-h-[88px] gap-4 rounded-[2rem] bg-[#292A28] px-5 py-4 text-paper shadow-[0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(41,42,40,0.22)] focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent max-[340px]:px-4"
          : "min-h-[64px] gap-3 px-5 py-3 text-ink focus-visible:z-10 focus-visible:ring-inset focus-visible:ring-ink-2 max-[340px]:px-4",
        isPressed && isFocus && "scale-[0.985] bg-[#343532]",
        isPressed && !isFocus && "scale-[0.985] bg-ink/[0.05]",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl",
          isFocus
            ? "size-12 bg-paper/10 text-accent-2"
            : "size-11 bg-ink/[0.04] text-accent",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 font-medium [overflow-wrap:anywhere]",
          isFocus ? "text-display-sm" : "text-heading",
        )}
      >
        {label}
      </span>
      {showCount && (
        <span
          dir="ltr"
          className="ms-auto shrink-0 rounded-full bg-ink/[0.05] px-2.5 py-1 font-mono text-small text-ink-2"
        >
          {count}
        </span>
      )}
    </Link>
  );
});
