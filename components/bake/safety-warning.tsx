import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export interface SafetyWarningProps {
  children: ReactNode;
}

export function SafetyWarning({ children }: SafetyWarningProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl bg-danger-bg border border-danger p-4 flex items-start gap-3"
    >
      <AlertTriangle size={20} aria-hidden className="text-danger shrink-0 mt-0.5" />
      <div className="text-body text-ink leading-relaxed">{children}</div>
    </section>
  );
}
