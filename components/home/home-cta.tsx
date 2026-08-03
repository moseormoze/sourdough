"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";

export type HomeCtaVariant = "primary" | "secondary";

export interface HomeCtaProps {
  href: string;
  icon: ReactNode;
  label: string;
  count?: number;
  variant?: HomeCtaVariant;
}

export function HomeCta({ href, icon, label, count, variant = "secondary" }: HomeCtaProps) {
  const router = useRouter();
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(
    () => router.push(href),
  );

  const isPrimary = variant === "primary";

  const showCount = count !== undefined && count > 0;

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? "" : undefined}
      aria-label={showCount ? `${label} · ${count}` : label}
      className={cn(
        "w-full flex items-center gap-4 rounded-2xl text-start",
        "transition-[transform,background-color,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        isPrimary
          ? "bg-accent text-paper shadow-cta py-6 px-6 min-h-[88px] focus-visible:ring-accent-2"
          : "bg-paper text-ink shadow-sm py-5 px-5 min-h-[72px] focus-visible:ring-ink-3",
        pressed && "scale-[0.985]",
        pressed && isPrimary && "bg-accent/95",
        pressed && !isPrimary && "bg-bg-2"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          isPrimary ? "bg-paper/15 text-paper w-12 h-12" : "bg-accent-bg text-accent w-11 h-11"
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 flex flex-col">
        <span
          className={cn(
            "font-medium",
            isPrimary ? "text-display-sm" : "text-heading"
          )}
        >
          {label}
        </span>
      </span>
      {showCount && (
        <span
          dir="ltr"
          className={cn(
            "rounded-full px-3 py-1 font-mono text-small",
            isPrimary ? "bg-paper/15 text-paper" : "bg-accent-bg text-accent"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
