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

/** Steps whose description is the (temp-adjusted) duration rather than fixed copy. */
const DURATION_DESC_KEYS = new Set<BakeStepKey>(["levain"]);

function stepDescription(step: BakeStep): string {
  const meta = strings.bakeScheduler.timelineSteps[step.key];
  const fixedDesc = "desc" in meta ? meta.desc : undefined;

  if (DURATION_DESC_KEYS.has(step.key)) {
    return durationLabel(step.durationSecs);
  }
  if (step.key === "bulk") {
    return `${durationLabel(step.durationSecs)} · ${fixedDesc}`;
  }
  return fixedDesc ?? "";
}

// ---------------------------------------------------------------------------
// TimelineRow
// ---------------------------------------------------------------------------

interface TimelineRowProps {
  step: BakeStep;
  now: Date;
}

function TimelineRow({ step, now }: TimelineRowProps) {
  const meta = strings.bakeScheduler.timelineSteps[step.key];
  const isReady = step.key === "ready";
  const desc = stepDescription(step);

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className={`text-body-sm font-medium ${isReady ? "text-accent" : "text-ink"}`}>
          {meta.label}
          {isReady && <span className="ms-1">✓</span>}
        </p>
        {desc && <p className="text-tiny text-ink-3 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0 text-end">
        <p className="text-tiny text-ink-3">{dayPrefix(step.startAt, now)}</p>
        <p className={`text-label font-semibold ${isReady ? "text-accent" : "text-ink"}`}>
          <span dir="ltr" className="num">
            {TIME_FMT.format(step.startAt)}
          </span>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BakeTimeline
// ---------------------------------------------------------------------------

export interface BakeTimelineProps {
  steps: BakeStep[];
  now: Date;
}

export function BakeTimeline({ steps, now }: BakeTimelineProps) {
  const s = strings.bakeScheduler;

  return (
    <div role="region" aria-label={s.timelineTitle} className="flex flex-col gap-4">
      {steps.map((step, i) => {
        const next = steps[i + 1];
        return (
          <div key={step.key} className="flex flex-col gap-4">
            <TimelineRow step={step} now={now} />
            {next && (
              <div
                className={`h-px ${next.key === "ready" ? "bg-line" : "bg-line/60"}`}
                aria-hidden
              />
            )}
          </div>
        );
      })}

      {/* Cooling — a recommendation after the loaf is out, not part of "ready" */}
      <div className="rounded-xl bg-bg-2 px-3 py-2.5 mt-1">
        <p className="text-tiny text-ink-2 leading-relaxed">💡 {s.coolingTip}</p>
      </div>
    </div>
  );
}
