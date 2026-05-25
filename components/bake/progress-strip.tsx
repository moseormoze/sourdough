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
              "flex-1 h-1.5 rounded-full transition-colors duration-base ease-out",
              isPast && "bg-accent",
              isCurrent && "bg-accent",
              !isPast && !isCurrent && "bg-line"
            )}
          />
        );
      })}
    </div>
  );
}
