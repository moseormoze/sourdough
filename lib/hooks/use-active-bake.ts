"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearActiveBake,
  loadActiveBake,
  saveActiveBake,
} from "@/lib/storage/active-bake";
import type { ActiveBake } from "@/lib/types/active-bake";
import type { Recipe } from "@/lib/types/recipe";
import { DEFAULT_BAKING_METHOD, type BakingMethod } from "@/lib/types/baking-method";

export interface UseActiveBakeApi {
  activeBake: ActiveBake | null;
  loading: boolean;
  start: (recipe: Recipe, bakingMethod?: BakingMethod) => ActiveBake;
  abandon: () => void;
  advanceTo: (stage: number) => void;
  advanceSubStep: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

export function useActiveBake(): UseActiveBakeApi {
  const [activeBake, setActiveBake] = useState<ActiveBake | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveBake(loadActiveBake());
    setLoading(false);
  }, []);

  const start = useCallback(
    (recipe: Recipe, bakingMethod: BakingMethod = DEFAULT_BAKING_METHOD): ActiveBake => {
      const now = Date.now();
      const next: ActiveBake = {
        id: crypto.randomUUID(),
        recipe,
        startedAt: now,
        currentStage: 1,
        stageStartedAt: now,
        observationChecks: {},
        subStep: 0,
        timerStartedAt: null,
        bakingMethod,
      };
      saveActiveBake(next);
      setActiveBake(next);
      return next;
    },
    []
  );

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
        subStep: 0,
        timerStartedAt: null,
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const advanceSubStep = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        subStep: current.subStep + 1,
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const startTimer = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        timerStartedAt: Date.now(),
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const stopTimer = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        timerStartedAt: null,
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  return {
    activeBake,
    loading,
    start,
    abandon,
    advanceTo,
    advanceSubStep,
    startTimer,
    stopTimer,
  };
}
