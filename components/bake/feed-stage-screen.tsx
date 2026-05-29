"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionalTimer } from "@/components/bake/optional-timer";
import { ChecklistReference } from "@/components/bake/checklist-reference";
import { startOfDay } from "@/lib/hooks/use-date-time-picker";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";

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

function dayPrefix(d: Date, now: Date): string {
  const diff = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000,
  );
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(d);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FeedStageScreenProps {
  activeBake: ActiveBake;
  onConfirmReady: () => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
}

export function FeedStageScreen({
  activeBake,
  onConfirmReady,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
}: FeedStageScreenProps) {
  const s = strings.feedStage;
  const router = useRouter();
  const now = useMemo(() => new Date(), []);

  const feedAt = activeBake.feedAt ? new Date(activeBake.feedAt) : null;
  const peakAt = activeBake.peakAt ? new Date(activeBake.peakAt) : null;

  const peakHours = feedAt && peakAt
    ? Math.round((peakAt.getTime() - feedAt.getTime()) / 3600000)
    : 0;

  const feedDurationSecs = feedAt && peakAt
    ? Math.round((peakAt.getTime() - feedAt.getTime()) / 1000)
    : 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.recipes.backToHome}
        </Button>
      </header>

      <div className="mb-2">
        <p className="text-tiny text-ink-3 uppercase tracking-wider">{s.subtitle}</p>
        <h1 className="text-display-sm text-ink">{s.title}</h1>
      </div>

      {/* Starter image */}
      <div className="rounded-2xl overflow-hidden relative h-48 w-full mb-6">
        <Image
          src="/stages/1-levain.png"
          alt="סטארטר מוכן: הוכפל בנפח, מלא בועות, גומייה מסמנת גובה התחלה"
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
          priority
        />
      </div>

      {/* Feed + Peak times */}
      <div className="rounded-2xl bg-accent-bg border border-accent/30 px-4 py-4 flex flex-col gap-4 mb-6">
        <p className="text-label text-accent font-medium">{s.title}</p>

        {feedAt && (
          <div className="flex flex-col gap-0.5">
            <p className="text-body-sm text-ink-2">{s.feedLabel}</p>
            <p className="text-body-sm text-ink-3">{dayPrefix(feedAt, now)}</p>
            <p className="text-heading text-ink font-semibold">
              <span dir="ltr" className="num">{TIME_FMT.format(feedAt)}</span>
            </p>
          </div>
        )}

        {feedAt && peakAt && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-accent/25" />
            <p className="text-body-sm text-ink-3 whitespace-nowrap">
              {s.durationBridge(peakHours)}
            </p>
            <div className="h-px flex-1 bg-accent/25" />
          </div>
        )}

        {peakAt && (
          <div className="flex flex-col gap-0.5">
            <p className="text-body-sm text-ink-2">{s.peakLabel}</p>
            <p className="text-body-sm text-ink-3">{dayPrefix(peakAt, now)}</p>
            <p className="text-heading text-ink font-semibold">
              <span dir="ltr" className="num">{TIME_FMT.format(peakAt)}</span>
            </p>
            <p className="text-body-sm text-ink-3 mt-1">{s.timeDisclaimer}</p>
          </div>
        )}
      </div>

      {/* Timer */}
      {feedDurationSecs > 0 && (
        <div className="rounded-2xl bg-paper border border-line px-4 py-4 flex flex-col items-center gap-3 mb-6">
          <p className="text-body-sm text-ink-3">{s.timerLabel}</p>
          <OptionalTimer
            durationSeconds={feedDurationSecs}
            startedAt={activeBake.timerStartedAt}
            elapsedSeconds={activeBake.timerElapsedSeconds}
            onStart={onStartTimer}
            onPause={onPauseTimer}
            onResume={onResumeTimer}
            onReset={onResetTimer}
          />
        </div>
      )}

      {/* Readiness signs */}
      <div className="mb-8">
        <ChecklistReference items={s.readinessSigns} title={s.readinessTitle} />
      </div>

      <Button variant="accent" onClick={onConfirmReady} className="w-full">
        {s.ctaButton}
      </Button>
    </main>
  );
}
