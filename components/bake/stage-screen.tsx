"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StageHeader } from "./stage-header";
import { BakeTimelineSheet } from "./bake-timeline-sheet";
import { Briefing } from "./briefing";
import { InstructionCard } from "./instruction-card";
import { ChecklistReference } from "./checklist-reference";
import { FoldDots } from "./fold-dots";
import { OptionalTimer } from "./optional-timer";
import { SafetyWarning } from "./safety-warning";
import { StageCelebration } from "./stage-celebration";
import { StageMedia } from "./stage-media";
import { getStage, TOTAL_STAGES, type Stage } from "@/lib/data/stages";
import { computeBakeQuantities } from "@/lib/bake-math";
import { FEED_RATIO_LABELS } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";
import type { UseActiveBakeApi } from "@/lib/hooks/use-active-bake";

export interface StageScreenProps {
  stage: Stage;
  activeBake: ActiveBake;
  api: Pick<
    UseActiveBakeApi,
    "advanceTo" | "advanceSubStep" | "startTimer" | "pauseTimer" | "resumeTimer" | "resetTimer"
  >;
}

export function StageScreen({ stage, activeBake, api }: StageScreenProps) {
  const router = useRouter();
  const [timelineOpen, setTimelineOpen] = useState(false);
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

  const foldsRemaining =
    stage.type === "bulk" &&
    typeof stage.subSteps === "number" &&
    activeBake.subStep < stage.subSteps;

  function handlePrimary() {
    if (stage.type === "done") {
      router.push("/bake/done");
      return;
    }
    api.advanceTo(stage.n + 1);
    router.push(`/bake/stage/${stage.n + 1}`);
  }

  function handleBack() {
    if (stage.n <= 1) return;
    api.advanceTo(stage.n - 1);
    router.push(`/bake/stage/${stage.n - 1}`);
  }

  const primaryLabel = (() => {
    if (stage.type === "done") return strings.bake.stageDone;
    if (nextStage) return strings.bake.stageNext(nextStage.name);
    return strings.bake.stageDone;
  })();

  const showBulkTimer = stage.type === "bulk" && durationSeconds !== undefined;
  const showStandaloneTimer = stage.type === "timer" && durationSeconds !== undefined;

  return (
    <>
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-44">
      <StageHeader
        stage={stage}
        totalStages={TOTAL_STAGES}
        kitchenTemp={activeBake.recipe.kitchenTemp}
        feedRatio={activeBake.feedRatio}
        retardHours={activeBake.retardHours}
        onTimelineOpen={() => setTimelineOpen(true)}
      />

      <div className="mt-6 flex flex-col gap-4">
        {stage.type === "done" && <StageCelebration />}
        {warning && <SafetyWarning>{warning}</SafetyWarning>}
        <Briefing briefing={briefing} disclosure={disclosure} />
        <StageMedia
          imageUrl={stage.imageUrl}
          imageAlt={stage.imageAlt}
          youtubeId={stage.youtubeId}
          videoCaption={stage.videoCaption}
        />

        {todoData && (
          <InstructionCard
            steps={todoData.steps}
            tip={todoData.tip}
            note={stage.todoNote}
            quantities={quantities}
          />
        )}

        {stage.type === "bulk" && typeof stage.subSteps === "number" && (
          <section className="rounded-2xl bg-paper shadow-sm p-5">
            <h3 className="text-heading text-ink">קיפולים</h3>
            <p className="mt-1 text-small text-ink-2">
              <span dir="ltr" className="num">
                {activeBake.subStep}
              </span>
              {" / "}
              <span dir="ltr" className="num">
                {stage.subSteps}
              </span>
              {" קיפולים בוצעו"}
            </p>
            <div className="mt-3">
              <FoldDots total={stage.subSteps} current={activeBake.subStep} />
            </div>
            {foldsRemaining && (
              <div className="mt-4">
                <Button variant="accent" size="sm" onClick={api.advanceSubStep}>
                  {strings.bake.stageFinishFold}
                </Button>
              </div>
            )}
            {showBulkTimer && durationSeconds !== undefined && (
              <div className="mt-4 pt-4 border-t border-line/60">
                <OptionalTimer
                  durationSeconds={durationSeconds}
                  startedAt={activeBake.timerStartedAt}
                  elapsedSeconds={activeBake.timerElapsedSeconds}
                  onStart={api.startTimer}
                  onPause={api.pauseTimer}
                  onResume={api.resumeTimer}
                  onReset={api.resetTimer}
                />
                <p className="mt-2 text-tiny text-ink-3 leading-relaxed">
                  3–4 קיפולים ב-2 השעות הראשונות — המרווחים יכולים לגדול ככל שהבצק מתחזק.
                </p>
              </div>
            )}
          </section>
        )}

        {checks && checks.length > 0 && (
          <ChecklistReference items={checks} />
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
            />
          </div>
        )}
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-0 inset-x-0 z-sticky bg-bg/95 backdrop-blur-sm border-t border-line">
        <div className="mx-auto max-w-md px-5 py-4">
          {stage.n > 1 ? (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex-1"
                iconStart={<ChevronRight size={18} />}
              >
                {strings.bake.stagePrev}
              </Button>
              <Button
                variant="accent"
                onClick={handlePrimary}
                className="flex-[2]"
                iconEnd={stage.type !== "done" ? <ChevronLeft size={18} /> : undefined}
              >
                {stage.type === "done" ? strings.bake.stageDone : strings.bake.stageNextShort}
              </Button>
            </div>
          ) : (
            <Button
              variant="accent"
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
    <BakeTimelineSheet
      isOpen={timelineOpen}
      currentStage={activeBake.currentStage}
      kitchenTemp={activeBake.recipe.kitchenTemp}
      feedRatio={activeBake.feedRatio}
      retardHours={activeBake.retardHours}
      onClose={() => setTimelineOpen(false)}
    />
    </>
  );
}

