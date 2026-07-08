"use client";

import posthog from "posthog-js";
import { normalizeEmail } from "@/lib/storage/identity";

let initialized = false;

interface InitOptions {
  apiKey: string;
  host: string;
}

export function initPostHog({ apiKey, host }: InitOptions): void {
  if (typeof window === "undefined") return;
  if (initialized) return;
  posthog.init(apiKey, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
    disable_session_recording: true,
    autocapture: false,
  });
  initialized = true;
}

export function captureEvent(name: string, props: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  posthog.capture(name, props);
}

export function identifyUser(email: string, props: { name: string }): void {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  const normalized = normalizeEmail(email);
  posthog.identify(normalized, { email: normalized, name: props.name });
  posthog.startSessionRecording();
}

export function isAnalyticsReady(): boolean {
  return initialized;
}
