"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { FeedbackFab } from "@/components/feedback/feedback-fab";
import { WelcomeGate } from "@/components/onboarding/welcome-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AnalyticsProvider />
      <WelcomeGate>
        {children}
        <FeedbackFab />
      </WelcomeGate>
    </ToastProvider>
  );
}
