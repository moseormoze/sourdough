"use client";

import { Fragment } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { strings } from "@/lib/strings";
import type {
  StageKnowledgeContent,
  StageKnowledgeKind,
} from "@/lib/data/stage-knowledge";

export interface StageKnowledgeSheetProps {
  open: boolean;
  kind: StageKnowledgeKind;
  content: StageKnowledgeContent;
  onClose: () => void;
}

const NUMBER_PATTERN = /(\d+(?:[–-]\d+)?)/g;

function MixedDirectionText({ children }: { children: string }) {
  return children.split(NUMBER_PATTERN).map((part, index) =>
    /^\d/.test(part) ? (
      <span key={`${part}-${index}`} dir="ltr" className="num">
        {part}
      </span>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    ),
  );
}

export function StageKnowledgeSheet({
  open,
  kind,
  content,
  onClose,
}: StageKnowledgeSheetProps) {
  const title =
    kind === "learn"
      ? content.learn.title
      : kind === "faq"
        ? strings.bake.stageKnowledge.faqTitle
        : strings.bake.stageKnowledge.troubleshootingTitle;

  return (
    <BottomSheet open={open} size="full" title={title} onClose={onClose}>
      {kind === "learn" && (
        <div className="pb-4">
          <p className="text-body-lg leading-relaxed text-ink-2">
            {content.learn.intro}
          </p>
          <div className="mt-5 flex flex-col gap-5">
            {content.learn.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-heading text-ink">{section.heading}</h3>
                <p className="mt-2 text-body leading-relaxed text-ink-2">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      )}

      {kind === "faq" && (
        <div className="flex flex-col gap-3 pb-4">
          {content.faqs.map((faq) => (
            <section key={faq.question} className="rounded-2xl bg-bg p-4">
              <h3 className="text-body-lg font-medium text-ink">{faq.question}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink-2">
                <MixedDirectionText>{faq.answer}</MixedDirectionText>
              </p>
            </section>
          ))}
        </div>
      )}

      {kind === "troubleshooting" && (
        <div className="flex flex-col gap-4 pb-4">
          {content.troubleshooting.map((scenario) => (
            <section
              key={scenario.title}
              className="rounded-2xl border border-warn/25 bg-warn-bg/35 p-4"
            >
              <h3 className="text-heading text-ink">{scenario.title}</h3>
              <h4 className="mt-4 text-small font-medium text-ink">
                {strings.bake.stageKnowledge.signsHeading}
              </h4>
              <ul role="list" className="mt-1 space-y-1.5">
                {scenario.signs.map((sign) => (
                  <li key={sign} className="flex items-start gap-2 text-body text-ink-2">
                    <span aria-hidden>•</span>
                    <span className="leading-relaxed">
                      <MixedDirectionText>{sign}</MixedDirectionText>
                    </span>
                  </li>
                ))}
              </ul>
              <h4 className="mt-4 text-small font-medium text-ink">
                {strings.bake.stageKnowledge.actionsHeading}
              </h4>
              <ol className="mt-1 list-decimal space-y-2 ps-5">
                {scenario.actions.map((action) => (
                  <li key={action} className="text-body leading-relaxed text-ink-2">
                    <MixedDirectionText>{action}</MixedDirectionText>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
