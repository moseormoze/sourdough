import { startOfDay } from "@/lib/hooks/use-date-time-picker";
import type { BakeTimelinePoints } from "@/lib/bake-timing";
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

// ---------------------------------------------------------------------------
// TimelineRow
// ---------------------------------------------------------------------------

interface TimelineRowProps {
  label: string;
  date: Date;
  now: Date;
  accent?: boolean;
}

function TimelineRow({ label, date, now, accent = false }: TimelineRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className={`text-body-sm ${accent ? "text-accent font-medium" : "text-ink-2"}`}>
          {label}
        </p>
        <p className="text-body-sm text-ink-3">{dayPrefix(date, now)}</p>
      </div>
      <p className={`text-label font-semibold shrink-0 ${accent ? "text-accent" : "text-ink"}`}>
        <span dir="ltr" className="num">
          {TIME_FMT.format(date)}
        </span>
        {accent && <span className="ms-1">✓</span>}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BakeTimeline
// ---------------------------------------------------------------------------

export interface BakeTimelineProps {
  points: BakeTimelinePoints;
  now: Date;
}

export function BakeTimeline({ points, now }: BakeTimelineProps) {
  const s = strings.bakeScheduler;

  return (
    <div
      role="region"
      aria-label="תוכנית הבייק"
      className="flex flex-col gap-3"
    >
      {points.feedAt && (
        <TimelineRow label={s.timelineFeedLabel} date={points.feedAt} now={now} />
      )}
      <TimelineRow label={s.timelineLevainLabel} date={points.levainStart} now={now} />
      <TimelineRow label={s.timelineBulkLabel} date={points.bulkStart} now={now} />
      <TimelineRow label={s.timelineOvenLabel} date={points.ovenStart} now={now} />
      <div className="h-px bg-line" />
      <TimelineRow
        label={s.timelineDoneLabel}
        date={points.breadReady}
        now={now}
        accent
      />
    </div>
  );
}
