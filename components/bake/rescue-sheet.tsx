"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { getRescue, type RescueVerdictId } from "@/lib/data/rescue";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/cn";

export interface RescueSheetProps {
  stageN: number;
  isOpen: boolean;
  onClose: () => void;
}

/* Verdict color language: sage = fine, accent = needs patience,
 * danger = needs action now. */
const VERDICT_STYLES: Record<
  RescueVerdictId,
  { card: string; title: string }
> = {
  ok: { card: "border-sage-2/50 bg-sage-bg/50", title: "text-sage-2" },
  under: { card: "border-accent-2 bg-accent-bg/40", title: "text-accent" },
  over: { card: "border-danger/50 bg-danger-bg/40", title: "text-danger" },
};

export function RescueSheet({ stageN, isOpen, onClose }: RescueSheetProps) {
  const rescue = getRescue(stageN);
  if (!rescue) return null;

  return (
    <BottomSheet
      open={isOpen}
      size="full"
      title={strings.bake.rescueSheetTitle}
      onClose={onClose}
    >
      <p className="text-body text-ink-2 leading-relaxed">{rescue.intro}</p>
      <div className="mt-4 flex flex-col gap-3">
        {rescue.verdicts.map((verdict) => {
          const styles = VERDICT_STYLES[verdict.id];
          return (
            <section
              key={verdict.id}
              className={cn("rounded-2xl border p-4", styles.card)}
            >
              <h3 className={cn("text-heading", styles.title)}>
                {verdict.title}
              </h3>
              <p className="mt-2 text-small font-medium text-ink">
                {strings.bake.rescueSigns}
              </p>
              <ul role="list" className="mt-1 space-y-1">
                {verdict.signs.map((sign, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-small text-ink-2 leading-relaxed"
                  >
                    <span aria-hidden className="mt-0.5">
                      •
                    </span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-small font-medium text-ink">
                {strings.bake.rescueSteps}
              </p>
              <ol className="mt-1 space-y-1.5 list-decimal ps-5">
                {verdict.steps.map((step, i) => (
                  <li key={i} className="text-small text-ink-2 leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </BottomSheet>
  );
}
