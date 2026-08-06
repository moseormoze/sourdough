"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StageHeader } from "./stage-header";
import { BakeTimelineSheet } from "./bake-timeline-sheet";
import { RescueSheet } from "./rescue-sheet";
import { Briefing } from "./briefing";
import { InstructionCard } from "./instruction-card";
import { ChecklistReference } from "./checklist-reference";
import { DoughTempCard } from "./dough-temp-card";
import { FoldDots } from "./fold-dots";
import { OptionalTimer } from "./optional-timer";
import { SafetyWarning } from "./safety-warning";
import { StageCelebration } from "./stage-celebration";
import { StageMedia } from "./stage-media";
import { AutolyseCalibration } from "./autolyse-calibration";
import { StageKnowledgeTrigger } from "./stage-knowledge-hub";
import { StageKnowledgeSheet } from "./stage-knowledge-sheet";
import { AutolyseTimer } from "./autolyse-timer";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AMBIENT_CANVAS, AMBIENT_GLASS } from "@/components/ui/ambient";
import {
  DEFAULT_AUTOLYSE_DURATION_SECONDS,
  deriveTimerSnapshot,
  formatTimerTime,
  resolveStageTimerOptions,
} from "@/lib/bake-timer";
import { getStage, TOTAL_STAGES, type Stage } from "@/lib/data/stages";
import { getRescue } from "@/lib/data/rescue";
import { getStageKnowledge } from "@/lib/data/stage-knowledge";
import { computeBakeQuantities } from "@/lib/bake-math";
import { FEED_RATIO_LABELS, starterPeakSecs } from "@/lib/bake-timing";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";
import type { UseActiveBakeApi } from "@/lib/hooks/use-active-bake";

export interface StageScreenProps {
  stage: Stage;
  activeBake: ActiveBake;
  api: Pick<
    UseActiveBakeApi,
    | "advanceTo"
    | "advanceSubStep"
    | "setDoughTemp"
    | "setTimerRemaining"
    | "startTimer"
    | "pauseTimer"
    | "resumeTimer"
    | "resetTimer"
  >;
}

export function StageScreen({ stage, activeBake, api }: StageScreenProps) {
  const router = useRouter();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [advanceConfirmOpen, setAdvanceConfirmOpen] = useState(false);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const rescue = getRescue(stage.n);
  const knowledge = getStageKnowledge(stage.n);
  const nextStage = getStage(stage.n + 1);
  const quantities = useMemo(
    () => computeBakeQuantities(activeBake.recipe, activeBake.feedRatio),
    [activeBake.recipe, activeBake.feedRatio]
  );

  const methodOverride = stage.byMethod?.[activeBake.bakingMethod];
  const briefing = methodOverride?.briefing ?? stage.briefing;
  const disclosure =
    stage.n === 1
      ? `יחס האכלה: ${FEED_RATIO_LABELS[activeBake.feedRatio]} (סטארטר:קמח:מים)`
      : stage.briefingDisclosure;
  const todoData = methodOverride?.todo ?? stage.todo;
  const checks = methodOverride?.checks ?? stage.checks;
  const durationSeconds = methodOverride?.durationSeconds ?? stage.durationSeconds;
  const warning = methodOverride?.warning;
  const isAutolysePilot = stage.n === 2;
  const autolyseDurationSeconds =
    activeBake.timerDurationSeconds ?? DEFAULT_AUTOLYSE_DURATION_SECONDS;
  const autolyseTimerSnapshot = deriveTimerSnapshot({
    durationSeconds: autolyseDurationSeconds,
    startedAt: activeBake.timerStartedAt,
    elapsedSeconds: activeBake.timerElapsedSeconds,
    nowMs: timerNow,
  });
  const autolyseTimerState = autolyseTimerSnapshot.phase;
  const autolyseFinished = autolyseTimerState === "finished";
  const autolyseTimerStatus = autolyseFinished
    ? strings.bake.autolyseTimer.finished
    : autolyseTimerState === "paused"
      ? strings.bake.autolyseTimer.paused
      : autolyseTimerState === "running"
        ? strings.bake.autolyseTimer.running
        : strings.bake.autolyseTimer.heading;
  const autolyseFormattedTime = formatTimerTime(
    autolyseTimerSnapshot.secondsLeft,
    autolyseDurationSeconds,
    "ceil",
  );

  useEffect(() => {
    if (
      !isAutolysePilot ||
      activeBake.timerStartedAt === null ||
      autolyseFinished
    ) return;
    setTimerNow(Date.now());
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [activeBake.timerStartedAt, autolyseFinished, isAutolysePilot]);

  const foldsRemaining =
    stage.type === "bulk" &&
    typeof stage.subSteps === "number" &&
    activeBake.subStep < stage.subSteps;

  function commitPrimary() {
    if (stage.type === "done") {
      router.push("/bake/done");
      return;
    }
    api.advanceTo(stage.n + 1);
    router.push(`/bake/stage/${stage.n + 1}`);
  }

  function handlePrimary() {
    if (isAutolysePilot && !autolyseFinished) {
      setAdvanceConfirmOpen(true);
      return;
    }
    commitPrimary();
  }

  function handleBack() {
    if (stage.n <= 1) return;
    api.advanceTo(stage.n - 1);
    router.push(`/bake/stage/${stage.n - 1}`);
  }

  function openKnowledge() {
    setKnowledgeOpen(true);
  }

  const primaryLabel = (() => {
    if (stage.type === "done") return strings.bake.stageDone;
    if (nextStage) return strings.bake.stageNext(nextStage.name);
    return strings.bake.stageDone;
  })();

  const glassCard = `${AMBIENT_GLASS} p-5 max-[340px]:p-4`;
  const showBulkTimer = stage.type === "bulk" && durationSeconds !== undefined;
  const showStandaloneTimer = stage.type === "timer" && durationSeconds !== undefined;
  const levainTimerSecs =
    stage.n === 1
      ? starterPeakSecs(activeBake.recipe.kitchenTemp, activeBake.feedRatio)
      : null;

  return (
    <>
    <div className={cn("min-h-dvh", AMBIENT_CANVAS)}>
    <main
      data-testid={isAutolysePilot ? "autolyse-redesign-pilot" : undefined}
      data-colorway="ambient-gradient"
      className={cn(
        "relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip",
        "px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-44 max-[340px]:px-4",
      )}
    >
      {isAutolysePilot ? (
        <>
          <div
            data-testid="autolyse-stage-header"
            data-surface="none"
          >
            <StageHeader
              stage={stage}
              totalStages={TOTAL_STAGES}
              kitchenTemp={activeBake.recipe.kitchenTemp}
              feedRatio={activeBake.feedRatio}
              retardHours={activeBake.retardHours}
              flour={activeBake.recipe.flour}
              onTimelineOpen={() => setTimelineOpen(true)}
              variant="pilot"
              rollout
            />
          </div>
          <div
            data-testid="autolyse-purpose-card"
            data-surface="glass"
            className={cn("mt-5", glassCard)}
          >
            <Briefing briefing={briefing} disclosure={disclosure} variant="pilot" />
          </div>
        </>
      ) : (
        <StageHeader
          stage={stage}
          totalStages={TOTAL_STAGES}
          kitchenTemp={activeBake.recipe.kitchenTemp}
          feedRatio={activeBake.feedRatio}
          retardHours={activeBake.retardHours}
          flour={activeBake.recipe.flour}
          onTimelineOpen={() => setTimelineOpen(true)}
          variant="pilot"
          rollout
        />
      )}

      <div className="mt-5 flex flex-col gap-5">
        {stage.type === "done" && <StageCelebration />}
        {warning && <SafetyWarning>{warning}</SafetyWarning>}
        {!isAutolysePilot && (
          <div data-surface="glass" className={glassCard}>
            <Briefing briefing={briefing} disclosure={disclosure} variant="pilot" />
          </div>
        )}
        {stage.type === "bulk" && stage.tempSensitiveBaseSecs != null && (
          <DoughTempCard
            doughTempC={activeBake.doughTempC}
            kitchenTempC={activeBake.recipe.kitchenTemp}
            flour={activeBake.recipe.flour}
            baseSecs={stage.tempSensitiveBaseSecs}
            onChange={api.setDoughTemp}
          />
        )}
        <StageMedia
          imageUrl={stage.imageUrl}
          imageAlt={stage.imageAlt}
          youtubeId={stage.youtubeId}
          videoCaption={stage.videoCaption}
        />

        {todoData && isAutolysePilot ? (
          <div
            data-testid="autolyse-instructions-surface"
            data-surface="glass"
            className={glassCard}
          >
            <InstructionCard
              steps={todoData.steps}
              tip={todoData.tip}
              note={stage.todoNote}
              quantities={quantities}
              variant="pilot"
            />
            <AutolyseCalibration initialCheck={checks?.[0] ?? ""} />
          </div>
        ) : todoData ? (
          <div data-surface="glass" className={glassCard}>
            <InstructionCard
              steps={todoData.steps}
              tip={todoData.tip}
              note={stage.todoNote}
              quantities={quantities}
              variant="pilot"
            />
          </div>
        ) : null}

        {stage.n === 2 && (
          <AutolyseTimer
            durationSeconds={
              autolyseDurationSeconds
            }
            startedAt={activeBake.timerStartedAt}
            elapsedSeconds={activeBake.timerElapsedSeconds}
            options={resolveStageTimerOptions(activeBake, stage)}
            nowMs={timerNow}
            onStart={(durationSeconds) => api.startTimer(durationSeconds)}
            onPause={api.pauseTimer}
            onResume={api.resumeTimer}
            onReset={api.resetTimer}
            onSetRemaining={api.setTimerRemaining}
          />
        )}

        {stage.type === "bulk" && typeof stage.subSteps === "number" && (
          <section data-surface="glass" className={glassCard}>
            <h3 className="text-heading text-ink">קיפולים</h3>
            <p className="mt-1 text-small text-ink-2">
              <span dir="ltr" className="num">
                {activeBake.subStep}
              </span>
              {" / "}
              <span dir="ltr" className="num">
                {stage.subSteps}
              </span>
              {" "}{strings.bake.foldProgressSuffix}
            </p>
            <div className="mt-3">
              <FoldDots total={stage.subSteps} current={activeBake.subStep} />
            </div>
            {foldsRemaining ? (
              <div className="mt-4">
                <Button variant="inset" size="sm" onClick={api.advanceSubStep}>
                  {strings.bake.stageFinishFold}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-small text-ink-2 leading-relaxed">
                כל הקיפולים בוצעו — מכאן לא נוגעים בבצק. רוב התסיסה קורית דווקא
                עכשיו, בשקט: עוד שעה-שעתיים בערך. עוברים לשלב הבא רק כשהבצק עומד
                בסימני ״מתי להמשיך״ שלמטה.
              </p>
            )}
            {showBulkTimer && durationSeconds !== undefined && (
              <div className="mt-4 pt-4 border-t border-ink/[0.08]">
                <OptionalTimer
                  durationSeconds={durationSeconds}
                  startedAt={activeBake.timerStartedAt}
                  elapsedSeconds={activeBake.timerElapsedSeconds}
                  onStart={api.startTimer}
                  onPause={api.pauseTimer}
                  onResume={api.resumeTimer}
                  onReset={api.resetTimer}
                  appearance="inset"
                />
                <p className="mt-2 text-tiny text-ink-3 leading-relaxed">
                  {foldsRemaining
                    ? "3–4 קיפולים ב-2 השעות הראשונות — המרווחים יכולים לגדול ככל שהבצק מתחזק."
                    : "הטיימר יכול להזכיר לכם לבדוק את הבצק כל ~30 דקות."}
                </p>
              </div>
            )}
          </section>
        )}

        {levainTimerSecs !== null && (
          <div className="self-start">
            <OptionalTimer
              durationSeconds={levainTimerSecs}
              startedAt={activeBake.timerStartedAt}
              elapsedSeconds={activeBake.timerElapsedSeconds}
              onStart={api.startTimer}
              onPause={api.pauseTimer}
              onResume={api.resumeTimer}
              onReset={api.resetTimer}
              appearance="inset"
            />
          </div>
        )}

        {checks && checks.length > 0 && (
          <ChecklistReference
            id={isAutolysePilot ? "autolyse-readiness" : undefined}
            items={isAutolysePilot ? checks.slice(1) : checks}
            imageUrl={stage.checkImageUrl}
            imageAlt={stage.checkImageAlt}
            imageWidth={stage.checkImageWidth}
            imageHeight={stage.checkImageHeight}
            transition={isAutolysePilot && !autolyseFinished ? undefined : stage.transition}
            decisionRule={stage.type === "bulk" ? strings.bake.bulkDecisionRule : undefined}
            variant="pilot"
            emphasized={false}
          />
        )}

        {stage.type === "bulk" && rescue && (
          <div className="self-center">
            <Button variant="ghost" size="sm" onClick={() => setRescueOpen(true)}>
              {strings.bake.bulkCompareTrigger}
            </Button>
          </div>
        )}

        {knowledge && (
          <StageKnowledgeTrigger onOpen={openKnowledge} />
        )}

        {showStandaloneTimer && durationSeconds !== undefined && (
          <div className="self-start">
            <OptionalTimer
              durationSeconds={durationSeconds}
              startedAt={activeBake.timerStartedAt}
              elapsedSeconds={activeBake.timerElapsedSeconds}
              onStart={api.startTimer}
              onPause={api.pauseTimer}
              onResume={api.resumeTimer}
              onReset={api.resetTimer}
              appearance="inset"
            />
          </div>
        )}

        {rescue && (
          <div className="self-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRescueOpen(true)}
              iconStart={<LifeBuoy size={16} aria-hidden />}
            >
              {strings.bake.rescueTrigger}
            </Button>
          </div>
        )}
      </div>

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-ink/[0.06] bg-[#FFF8F1]/90 supports-[backdrop-filter]:bg-paper/60 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-[340px]:px-4">
          {stage.n > 1 ? (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex-1 hover:!bg-ink/[0.04]"
                iconStart={<ChevronRight size={18} />}
              >
                {strings.bake.stagePrev}
              </Button>
              <Button
                variant="primary"
                onClick={handlePrimary}
                className="flex-1"
                data-priority={isAutolysePilot ? "secondary" : "primary"}
                iconEnd={stage.type !== "done" ? <ChevronLeft size={18} /> : undefined}
              >
                {stage.type === "done" ? strings.bake.stageDone : strings.bake.stageNextShort}
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handlePrimary}
              className="w-full"
              iconEnd={stage.type !== "done" ? <ChevronLeft size={18} /> : undefined}
            >
              {primaryLabel}
            </Button>
          )}
        </div>
      </div>
    </main>
    </div>
    <BakeTimelineSheet
      isOpen={timelineOpen}
      currentStage={activeBake.currentStage}
      kitchenTemp={activeBake.recipe.kitchenTemp}
      feedRatio={activeBake.feedRatio}
      retardHours={activeBake.retardHours}
      flour={activeBake.recipe.flour}
      onClose={() => setTimelineOpen(false)}
    />
    {isAutolysePilot && (
      <BottomSheet
        open={advanceConfirmOpen}
        size="peek"
        title={stage.name}
        variant="pilot"
        onClose={() => setAdvanceConfirmOpen(false)}
      >
        <div
          data-testid="autolyse-advance-status"
          data-surface="inset"
          className="flex items-center justify-between gap-4 rounded-2xl bg-ink/[0.04] px-4 py-3"
        >
          <p className="text-body font-medium text-ink">
            {autolyseTimerState === "idle"
              ? strings.bake.autolyseTimer.idleHint
              : autolyseTimerStatus}
          </p>
          <span
            dir="ltr"
            className="num shrink-0 font-mono text-body-lg font-semibold tabular-nums text-ink"
          >
            {autolyseFormattedTime}
          </span>
        </div>
        <div className="mt-6 grid gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setAdvanceConfirmOpen(false);
              commitPrimary();
            }}
          >
            {strings.bake.stageNextShort}
          </Button>
          <Button
            variant="ghost"
            className="hover:!bg-ink/[0.04]"
            onClick={() => setAdvanceConfirmOpen(false)}
          >
            {strings.common.cancel}
          </Button>
        </div>
      </BottomSheet>
    )}
    {knowledge && (
      <StageKnowledgeSheet
        open={knowledgeOpen}
        content={knowledge}
        recipe={activeBake.recipe}
        onClose={() => setKnowledgeOpen(false)}
      />
    )}
    {rescue && (
      <RescueSheet
        stageN={stage.n}
        isOpen={rescueOpen}
        onClose={() => setRescueOpen(false)}
      />
    )}
    </>
  );
}
