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
import { DEFAULT_FEED_RATIO, type FeedRatio } from "@/lib/bake-timing";
import { track } from "@/lib/analytics/track";

export interface UseActiveBakeApi {
  activeBake: ActiveBake | null;
  loading: boolean;
  start: (recipe: Recipe, bakingMethod?: BakingMethod, feedAt?: Date, peakAt?: Date, feedRatio?: FeedRatio) => ActiveBake;
  abandon: () => void;
  completeFeedStage: () => void;
  advanceTo: (stage: number) => void;
  advanceSubStep: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

export function useActiveBake(): UseActiveBakeApi {
  const [activeBake, setActiveBake] = useState<ActiveBake | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveBake(loadActiveBake());
    setLoading(false);
  }, []);

  const start = useCallback(
    (
      recipe: Recipe,
      bakingMethod: BakingMethod = DEFAULT_BAKING_METHOD,
      feedAt?: Date,
      peakAt?: Date,
      feedRatio: FeedRatio = DEFAULT_FEED_RATIO,
    ): ActiveBake => {
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
        timerElapsedSeconds: 0,
        bakingMethod,
        feedAt: feedAt ? feedAt.getTime() : null,
        peakAt: peakAt ? peakAt.getTime() : null,
        feedStagePassed: false,
        feedRatio,
      };
      saveActiveBake(next);
      setActiveBake(next);
      track("bake_started", {
        recipeName: recipe.name,
        bakingMethod,
        flourWeightGrams: recipe.flourWeightGrams,
      });
      return next;
    },
    []
  );

  const abandon = useCallback(() => {
    clearActiveBake();
    setActiveBake(null);
  }, []);

  const completeFeedStage = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        feedStagePassed: true,
        stageStartedAt: Date.now(),
      };
      saveActiveBake(next);
      return next;
    });
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
        timerElapsedSeconds: 0,
      };
      saveActiveBake(next);
      track("stage_advanced", { from: current.currentStage, to: stage });
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
        timerElapsedSeconds: 0,
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      if (current.timerStartedAt === null) return current;
      const segmentSeconds = (Date.now() - current.timerStartedAt) / 1000;
      const next: ActiveBake = {
        ...current,
        timerStartedAt: null,
        timerElapsedSeconds: current.timerElapsedSeconds + segmentSeconds,
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      if (current.timerStartedAt !== null) return current;
      const next: ActiveBake = {
        ...current,
        timerStartedAt: Date.now(),
      };
      saveActiveBake(next);
      return next;
    });
  }, []);

  const resetTimer = useCallback(() => {
    setActiveBake((current) => {
      if (!current) return current;
      const next: ActiveBake = {
        ...current,
        timerStartedAt: null,
        timerElapsedSeconds: 0,
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
    completeFeedStage,
    advanceTo,
    advanceSubStep,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
