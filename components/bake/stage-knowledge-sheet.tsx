"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  getAutolyseGuidance,
  type StageKnowledgeContent,
} from "@/lib/data/stage-knowledge";
import { strings } from "@/lib/strings";
import type { Flour, Recipe } from "@/lib/types/recipe";

export interface StageKnowledgeSheetProps {
  open: boolean;
  content: StageKnowledgeContent;
  recipe: Recipe;
  onClose: () => void;
}

const FLOUR_KEYS = [
  "white",
  "wholeWheat",
  "rye",
  "speltWhite",
  "speltWhole",
  "other",
] as const satisfies readonly (keyof Flour)[];

const numberFormatter = new Intl.NumberFormat("he-IL", {
  maximumFractionDigits: 1,
});

function NumberValue({ children }: { children: string }) {
  return (
    <span dir="ltr" className="num">
      {children}
    </span>
  );
}

function FlourSummary({ flour }: { flour: Flour }) {
  const entries = FLOUR_KEYS.filter((key) => flour[key] > 0);

  return (
    <span>
      {entries.map((key, index) => (
        <span key={key}>
          {index > 0 && " · "}
          <NumberValue>{`${numberFormatter.format(flour[key])}%`}</NumberValue>
          {" "}
          {strings.bake.flourTypeLabels[key]}
        </span>
      ))}
    </span>
  );
}

function ConceptualGraph({ graph }: { graph: StageKnowledgeContent["graph"] }) {
  return (
    <figure className="mt-3 rounded-2xl border border-line/70 bg-bg-2/35 p-4">
      <div
        role="img"
        aria-label={graph.description}
        dir="ltr"
        className="overflow-hidden rounded-xl bg-paper/80 p-3"
      >
        <svg
          viewBox="0 0 320 160"
          className="h-auto w-full"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M18 142 H302" fill="none" stroke="currentColor" opacity="0.18" />
          <path
            d="M18 136 C70 70 132 38 302 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-sage"
          />
          <path
            d="M18 140 C150 139 231 116 302 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="8 7"
            strokeLinecap="round"
            className="text-warn"
          />
        </svg>
        <div className="mt-1 flex justify-between gap-3 text-tiny text-ink-3">
          <span dir="rtl">{graph.startLabel}</span>
          <span dir="rtl">{graph.endLabel}</span>
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 text-small text-ink-2">
        <p className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-7 shrink-0 rounded-full bg-sage" />
          {graph.hydrationLabel}
        </p>
        <p className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0 w-7 shrink-0 border-t-2 border-dashed border-warn"
          />
          {graph.weakeningLabel}
        </p>
      </div>
      <figcaption className="mt-3 text-tiny leading-relaxed text-ink-3">
        {graph.description}
      </figcaption>
    </figure>
  );
}

function RecipeContext({
  content,
  recipe,
}: {
  content: StageKnowledgeContent["recipeContext"];
  recipe: Recipe;
}) {
  const guidance = getAutolyseGuidance(recipe);

  return (
    <section
      role="region"
      aria-label={content.heading}
      className="border-t border-line/70 pt-6"
    >
      <h3 className="text-heading text-ink">{content.heading}</h3>

      <dl className="mt-3 grid gap-2 rounded-2xl bg-bg-2/45 p-4 text-small">
        <div className="grid gap-0.5">
          <dt className="text-tiny text-ink-3">{strings.bakeConfirm.flour}</dt>
          <dd className="leading-relaxed text-ink-2">
            <FlourSummary flour={recipe.flour} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-tiny text-ink-3">{strings.form.hydration}</dt>
          <dd className="text-ink-2">
            <NumberValue>{`${numberFormatter.format(recipe.hydration)}%`}</NumberValue>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-tiny text-ink-3">{strings.form.kitchenTemp}</dt>
          <dd className="text-ink-2">
            <NumberValue>{`${numberFormatter.format(recipe.kitchenTemp)}°C`}</NumberValue>
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-3">
        {guidance.map((factor) => (
          <p
            key={factor}
            data-testid="autolyse-guidance-factor"
            className="border-s-2 border-line ps-3 text-body leading-relaxed text-ink-2"
          >
            {content.guidance[factor]}
          </p>
        ))}
      </div>
    </section>
  );
}

export function StageKnowledgeSheet({
  open,
  content,
  recipe,
  onClose,
}: StageKnowledgeSheetProps) {
  return (
    <BottomSheet open={open} size="full" title={content.title} onClose={onClose}>
      <div className="space-y-6 pb-4">
        <p className="text-body-lg leading-relaxed text-ink-2">{content.intro}</p>

        <section className="border-t border-line/70 pt-6">
          <h3 className="text-heading text-ink">{content.mechanism.heading}</h3>
          <p className="mt-2 text-body leading-relaxed text-ink-2">
            {content.mechanism.body}
          </p>
        </section>

        <section className="border-t border-line/70 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-heading text-ink">{content.graph.title}</h3>
            <span className="rounded-full bg-bg-2 px-2.5 py-1 text-tiny text-ink-3">
              {content.graph.badge}
            </span>
          </div>
          <ConceptualGraph graph={content.graph} />
        </section>

        <RecipeContext content={content.recipeContext} recipe={recipe} />

        <div className="border-t border-line/70 pt-6">
          <p className="text-body leading-relaxed text-ink-2">
            {content.practicalCheck}
          </p>
          <p className="mt-3 rounded-2xl bg-bg-2/55 p-4 text-body font-medium leading-relaxed text-ink">
            {content.decisionRule}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
