"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AnalyticsProvider />
      {children}
    </ToastProvider>
  );
}
