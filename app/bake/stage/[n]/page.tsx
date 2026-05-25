"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BakeStageStubScreen } from "@/components/bake/bake-stage-stub-screen";
import { useActiveBake } from "@/lib/hooks/use-active-bake";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ n: string }>();
  const { activeBake, loading } = useActiveBake();

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

  return <BakeStageStubScreen stageNumber={requested} />;
}
