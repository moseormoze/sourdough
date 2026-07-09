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
    advanceTo,
    advanceSubStep,
    setDoughTemp,
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
    if (activeBake.currentStage !== requested) {
      router.replace(`/bake/stage/${activeBake.currentStage}`);
    }
  }, [loading, activeBake, validRequest, requested, router]);

  if (loading || !activeBake || !validRequest || activeBake.currentStage !== requested) {
    return null;
  }

  const stage = getStage(requested);
  if (!stage) return null;

  return (
    <StageScreen
      stage={stage}
      activeBake={activeBake}
      api={{ advanceTo, advanceSubStep, setDoughTemp, startTimer, pauseTimer, resumeTimer, resetTimer }}
    />
  );
}
