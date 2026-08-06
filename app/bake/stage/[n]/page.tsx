"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StageScreen } from "@/components/bake/stage-screen";
import { useActiveBake } from "@/lib/hooks/use-active-bake";
import { getStage } from "@/lib/data/stages";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ n: string }>();
  const {
    activeBake,
    loading,
    commitTo,
    advanceSubStep,
    setDoughTemp,
    setTimerRemaining,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useActiveBake();

  const requestedRaw = params.n;
  const requested = Number(requestedRaw);
  const validRequest = Number.isInteger(requested) && requested >= 1 && requested <= 12;

  useEffect(() => {
    if (loading) return;
    if (!activeBake) {
      router.replace("/");
      return;
    }
    if (!validRequest) {
      router.replace(`/bake/stage/${activeBake.currentStage}`);
      return;
    }
    // Stages already completed stay readable — that is how the baker re-reads an
    // earlier step while the current wait keeps running. Only skipping *ahead*
    // is redirected, which preserves the original no-skip guard.
    if (requested > activeBake.currentStage) {
      router.replace(`/bake/stage/${activeBake.currentStage}`);
    }
  }, [loading, activeBake, validRequest, requested, router]);

  if (loading || !activeBake || !validRequest || requested > activeBake.currentStage) {
    return null;
  }

  const stage = getStage(requested);
  if (!stage) return null;

  return (
    <StageScreen
      stage={stage}
      activeBake={activeBake}
      api={{
        commitTo,
        advanceSubStep,
        setDoughTemp,
        setTimerRemaining,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
      }}
    />
  );
}
