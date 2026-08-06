import { cn } from "@/lib/cn";

export interface ProgressStripProps {
  total: number;
  current: number;
}

export function ProgressStrip({ total, current }: ProgressStripProps) {
  return (
    <div
      role="progressbar"
      aria-label={`שלב ${current} מתוך ${total}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex items-center gap-1 w-full"
    >
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const isPast = n < current;
        const isCurrent = n === current;
        return (
          <span
            key={n}
            data-segment={n}
            data-state={isPast ? "past" : isCurrent ? "current" : "future"}
            className={cn(
              "h-[5px] rounded-[3px] transition-[flex,background-color,box-shadow] duration-base ease-out",
              isCurrent ? "flex-[2.2]" : "flex-1",
              isPast && "bg-ink-3/55",
              isCurrent && "bg-gradient-to-r from-accent-2 to-accent shadow-[0_0_0_3px_rgba(230,107,61,0.14)]",
              !isPast && !isCurrent && "bg-ink/10"
            )}
          />
        );
      })}
    </div>
  );
}
