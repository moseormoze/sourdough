"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics/posthog-client";

export function AnalyticsProvider() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
    if (!apiKey) return;
    initPostHog({ apiKey, host });
  }, []);
  return null;
}
