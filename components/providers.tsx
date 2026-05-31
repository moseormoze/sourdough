"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { FeedbackFab } from "@/components/feedback/feedback-fab";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AnalyticsProvider />
      {children}
      <FeedbackFab />
    </ToastProvider>
  );
}
