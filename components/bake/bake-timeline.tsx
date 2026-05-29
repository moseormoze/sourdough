import { cn } from "@/lib/cn";
import { startOfDay } from "@/lib/hooks/use-date-time-picker";
import { durationLabel, type BakeStep, type BakeStepKey } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const DAY_FMT = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// The step whose trailing wait is the overnight cold retard — drawn dashed + 🌙.
const NIGHT_STEP: BakeStepKey = "shapeRetard";
// Steps whose wait text is the (temp-adjusted) duration rather than fixed copy.
const DURATION_WAIT_KEYS = new Set<BakeStepKey>(["levain", "bulk"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function dayPrefix(d: Date, now: Date): string {
  const diff = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000,
  );
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(d);
}

/** Text shown on the connector below a node — the wait until the next action. */
function waitText(step: BakeStep): string {
  const meta = strings.bakeScheduler.timelineSteps[step.key];
  const fixed = "desc" in meta ? meta.desc : undefined;

  if (step.key === "levain") return durationLabel(step.durationSecs);
  if (step.key === "bulk") return `${durationLabel(step.durationSecs)} · ${fixed}`;
  return fixed ?? "";
}

// ---------------------------------------------------------------------------
// BakeTimeline — vertical "journey" spine.
// Nodes are the actions you take; the line between them is the waiting.
// ---------------------------------------------------------------------------

export interface BakeTimelineProps {
  steps: BakeStep[];
  now: Date;
}

export function BakeTimeline({ steps, now }: BakeTimelineProps) {
  const s = strings.bakeScheduler;

  return (
    <div role="region" aria-label={s.timelineTitle}>
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isReady = step.key === "ready";
          const isNight = step.key === NIGHT_STEP;
          const meta = s.timelineSteps[step.key];
          const wait = isReady ? "" : waitText(step);

          return (
            <li key={step.key} className="flex gap-3">
              {/* Rail: node + connecting line */}
              <div className="flex flex-col items-center w-4 shrink-0">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 shrink-0 rounded-full bg-bg",
                    isReady
                      ? "w-3.5 h-3.5 bg-accent ring-4 ring-accent/15"
                      : "w-2.5 h-2.5 border-2 border-ink-3",
                  )}
                />
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "flex-1 w-0 my-1 border-s-2",
                      isNight ? "border-dashed border-accent/45" : "border-line-2",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0 -mt-0.5", isLast ? "pb-0" : "pb-6")}>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className={cn(
                      "text-body font-medium",
                      isReady ? "text-accent" : "text-ink",
                    )}
                  >
                    {isReady && <span className="me-1">✓</span>}
                    {meta.label}
                  </p>
                  <div className="shrink-0 text-end">
                    <p className="text-tiny text-ink-3 leading-none">
                      {dayPrefix(step.startAt, now)}
                    </p>
                    <p
                      className={cn(
                        "text-label font-semibold mt-0.5",
                        isReady ? "text-accent" : "text-ink",
                      )}
                    >
                      <span dir="ltr" className="num">
                        {TIME_FMT.format(step.startAt)}
                      </span>
                    </p>
                  </div>
                </div>
                {wait && (
                  <p className="mt-1.5 text-tiny text-ink-3">
                    {isNight && <span className="me-1">🌙</span>}
                    {wait}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Cooling — a recommendation after the loaf is out, not part of "ready" */}
      <div className="rounded-xl bg-bg-2 px-3 py-2.5 mt-3">
        <p className="text-tiny text-ink-2 leading-relaxed">💡 {s.coolingTip}</p>
      </div>
    </div>
  );
}
