import type { AnalyticsEvent } from "./events";
import { captureEvent } from "./posthog-client";

/**
 * Type-safe analytics dispatcher. Pick an event name and the matching
 * payload is enforced by the AnalyticsEvent union.
 *
 *   track("bake_started", { recipeName, bakingMethod, flourWeightGrams });
 *
 * Safe to call before PostHog is initialized — drops the event silently.
 */
export function track<N extends AnalyticsEvent["name"]>(
  name: N,
  props: Extract<AnalyticsEvent, { name: N }>["props"]
): void {
  captureEvent(name, props);
}
