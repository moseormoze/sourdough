import { Info } from "lucide-react";
import type { StageBriefing } from "@/lib/data/stages";

export interface BriefingProps {
  briefing: StageBriefing;
  disclosure?: string;
}

export function Briefing({ briefing, disclosure }: BriefingProps) {
  return (
    <section
      aria-label={briefing.heading}
      className="rounded-2xl bg-gradient-to-br from-accent-bg to-accent-2/30 p-5"
    >
      <h2 className="text-heading text-ink">{briefing.heading}</h2>
      <p className="mt-2 text-body-lg text-ink">{briefing.blurb}</p>
      <ul role="list" className="mt-3 space-y-1">
        {briefing.takeaways.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-body text-ink-2">
            <span aria-hidden className="text-accent ms-0 me-0">·</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {disclosure && (
        <p className="mt-3 flex items-start gap-1.5 text-small text-ink-2">
          <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-ink-3" />
          <span>{disclosure}</span>
        </p>
      )}
    </section>
  );
}
