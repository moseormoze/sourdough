import { Info } from "lucide-react";
import type { StageBriefing } from "@/lib/data/stages";
import { cn } from "@/lib/cn";

export interface BriefingProps {
  briefing: StageBriefing;
  disclosure?: string;
  variant?: "default" | "pilot";
}

export function Briefing({ briefing, disclosure, variant = "default" }: BriefingProps) {
  return (
    <section
      aria-label={briefing.heading}
      className={cn(
        variant === "pilot"
          ? "bg-transparent"
          : "rounded-2xl bg-gradient-to-br from-accent-bg to-accent-2/30 p-5",
      )}
    >
      <h2 className="text-heading text-ink">{briefing.heading}</h2>
      <p className="mt-2 text-body-lg text-ink">{briefing.blurb}</p>
      {briefing.takeaways.length > 0 && (
        <ul role="list" className="mt-3 space-y-1">
          {briefing.takeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-body text-ink-2">
              <span aria-hidden className="text-ink-3 ms-0 me-0">·</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {disclosure && (
        <p className="mt-3 flex items-start gap-1.5 text-small text-ink-2">
          <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-ink-3" />
          <span>{disclosure}</span>
        </p>
      )}
    </section>
  );
}
