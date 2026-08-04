import { Timer } from "lucide-react";
import type { HomeBakeStatus } from "@/lib/home-bake-status";
import { strings } from "@/lib/strings";

type VisibleHomeBakeStatus = Exclude<HomeBakeStatus, { kind: "none" }>;

export function HomeBakeStatusView({ status }: { status: VisibleHomeBakeStatus }) {
  if (status.kind === "timer") {
    return (
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1">
        <span
          className="row-span-2 flex size-9 items-center justify-center rounded-full bg-paper/[0.08] text-accent-2"
          aria-hidden
        >
          <Timer size={18} />
        </span>
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-small text-paper/65"
        >
          {strings.bake.timerStatus[status.phase]}
        </span>
        <span
          dir="ltr"
          className="num text-xl font-medium leading-none text-paper"
        >
          {status.formattedTime}
        </span>
      </div>
    );
  }

  const progressLabel = strings.bake.foldProgress(status.current, status.total);

  return (
    <div
      role="progressbar"
      aria-label={progressLabel}
      aria-valuemin={0}
      aria-valuemax={status.total}
      aria-valuenow={status.current}
      className="grid gap-3"
    >
      <span className="text-small text-paper/70">
        {progressLabel}
      </span>
      <span
        data-testid="home-fold-dots"
        aria-hidden="true"
        className="flex min-w-0 flex-wrap gap-1.5"
      >
        {Array.from({ length: status.total }, (_, index) => (
          <span
            key={index}
            data-testid="home-fold-dot"
            className={
              index < status.current
                ? "size-2 rounded-full bg-accent"
                : "size-2 rounded-full border border-paper/35 bg-transparent"
            }
          />
        ))}
      </span>
    </div>
  );
}
