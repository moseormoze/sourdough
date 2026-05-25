import { cn } from "@/lib/cn";

export interface FoldDotsProps {
  total: number;
  current: number;
  label?: string;
}

export function FoldDots({ total, current, label }: FoldDotsProps) {
  return (
    <div
      role="status"
      aria-label={label ?? `קיפול ${current} מתוך ${total}`}
      className="flex items-center gap-2"
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        return (
          <span
            key={i}
            data-fold={i + 1}
            data-state={filled ? "filled" : "empty"}
            className={cn(
              "w-3 h-3 rounded-full transition-colors duration-base ease-out",
              filled ? "bg-accent" : "bg-line border border-line-2"
            )}
          />
        );
      })}
    </div>
  );
}
