"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeedStageScreen } from "@/components/bake/feed-stage-screen";
import { useActiveBake } from "@/lib/hooks/use-active-bake";

export default function Page() {
  const router = useRouter();
  const {
    activeBake,
    loading,
    completeFeedStage,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useActiveBake();

  useEffect(() => {
    if (loading) return;
    if (!activeBake) {
      router.replace("/");
      return;
    }
    // If feedAt is null the starter was already ready — go straight to stage 1
    if (activeBake.feedAt === null) {
      router.replace("/bake/stage/1");
    }
  }, [loading, activeBake, router]);

  if (loading || !activeBake || activeBake.feedAt === null) return null;

  function handleConfirmReady() {
    completeFeedStage();
    router.push("/bake/stage/1");
  }

  return (
    <FeedStageScreen
      activeBake={activeBake}
      onConfirmReady={handleConfirmReady}
      onStartTimer={startTimer}
      onPauseTimer={pauseTimer}
      onResumeTimer={resumeTimer}
      onResetTimer={resetTimer}
    />
  );
}
