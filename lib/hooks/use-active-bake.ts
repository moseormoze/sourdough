"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearActiveBake,
  loadActiveBake,
  saveActiveBake,
} from "@/lib/storage/active-bake";
import type { ActiveBake } from "@/lib/types/active-bake";
import type { Recipe } from "@/lib/types/recipe";

export interface UseActiveBakeApi {
  activeBake: ActiveBake | null;
  loading: boolean;
  start: (recipe: Recipe) => ActiveBake;
  abandon: () => void;
  advanceTo: (stage: number) => void;
}

export function useActiveBake(): UseActiveBakeApi {
  const [activeBake, setActiveBake] = useState<ActiveBake | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveBake(loadActiveBake());
    setLoading(false);
  }, []);

  const start = useCallback((recipe: Recipe): ActiveBake => {
    const now = Date.now();
    const next: ActiveBake = {
      id: crypto.randomUUID(),
      recipe,
      startedAt: now,
      currentStage: 1,
      stageStartedAt: now,
      observationChecks: {},
    };
    saveActiveBake(next);
    setActiveBake(next);
    return next;
  }, []);

  const abandon = useCallback(() => {
    clearActiveBake();
    setActiveBake(null);
  }, []);

  const advanceTo = useCallback((stage: number) => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        currentStage: stage,
        stageStartedAt: Date.now(),
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  return { activeBake, loading, start, abandon, advanceTo };
}
