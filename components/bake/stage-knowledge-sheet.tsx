"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  getStageGuidance,
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

type GuideGraph = NonNullable<StageKnowledgeContent["graph"]>;

function ConceptualGraph({ graph }: { graph: GuideGraph }) {
  return (
    <figure className="mt-4">
      <div
        data-testid="autolyse-conceptual-plot"
        data-surface="inset"
        role="img"
        aria-label={graph.description}
        dir="ltr"
        className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-ink/[0.03] p-3"
      >
        <svg
          data-testid="autolyse-conceptual-graph"
          viewBox="0 0 320 160"
          className="h-auto w-full"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M18 142 H302" fill="none" stroke="currentColor" className="text-line-2" />
          <path
            data-curve="hydration"
            d="M18 136 C72 76 145 54 302 52"
            fill="none"
            stroke="currentColor"
            className="text-ink-2"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            data-curve="weakening"
            d="M18 140 C155 139 238 112 302 34"
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="3.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-1 flex justify-between gap-3 text-tiny text-ink-2">
          <span dir="rtl">{graph.startLabel}</span>
          <span dir="rtl">{graph.endLabel}</span>
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 text-small text-ink-2">
        <p className="flex items-center gap-2">
          <span aria-hidden className="h-1 w-7 shrink-0 rounded-full bg-ink-2" />
          {graph.hydrationLabel}
        </p>
        <p className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0 w-7 shrink-0 border-t-2 border-dashed border-accent"
          />
          {graph.weakeningLabel}
        </p>
      </div>
      <figcaption className="mt-3 text-tiny leading-relaxed text-ink-2">
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
  const guidance = getStageGuidance(recipe);

  return (
    <section
      role="region"
      aria-label={content.heading}
      data-testid="autolyse-guide-recipe"
      data-surface="glass"
      className="rounded-[2rem] border border-paper/55 bg-paper/30 p-5 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-full bg-[#F28A55] shadow-[0_0_0_6px_rgba(242,138,85,0.12)]"
        />
        <h3 className="text-heading text-ink">{content.heading}</h3>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-small">
        <div
          data-testid="autolyse-guide-inset"
          className="col-span-2 grid gap-0.5 rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-3.5"
        >
          <dt className="text-tiny text-ink-2">{strings.bakeConfirm.flour}</dt>
          <dd className="leading-relaxed text-ink-2">
            <FlourSummary flour={recipe.flour} />
          </dd>
        </div>
        <div
          data-testid="autolyse-guide-inset"
          className="grid gap-1 rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-3.5"
        >
          <dt className="text-tiny text-ink-2">{strings.form.hydration}</dt>
          <dd className="text-body-lg font-semibold text-ink">
            <NumberValue>{`${numberFormatter.format(recipe.hydration)}%`}</NumberValue>
          </dd>
        </div>
        <div
          data-testid="autolyse-guide-inset"
          className="grid gap-1 rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-3.5"
        >
          <dt className="text-tiny text-ink-2">{strings.form.kitchenTemp}</dt>
          <dd className="text-body-lg font-semibold text-ink">
            <NumberValue>{`${numberFormatter.format(recipe.kitchenTemp)}°C`}</NumberValue>
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-3">
        {guidance.map((factor) => (
          <p
            key={factor}
            data-testid="autolyse-guidance-factor"
            data-surface="inset"
            className="rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-4 text-body leading-relaxed text-ink-2"
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
    <BottomSheet
      open={open}
      size="full"
      title={content.title}
      onClose={onClose}
      variant="pilot"
    >
      <div
        data-testid="autolyse-guide-redesign"
        data-colorway="ambient-glass"
        className="space-y-4 pb-4"
      >
        <section
          data-testid="autolyse-guide-intro"
          data-surface="glass"
          className="relative isolate overflow-hidden rounded-[2rem] border border-paper/55 bg-paper/30 p-5 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] backdrop-blur-sm"
        >
          <span
            aria-hidden
            className="absolute -end-10 -top-10 -z-10 size-32 rounded-full border-[18px] border-paper/35"
          />
          <p className="max-w-[19rem] text-body-lg font-medium leading-relaxed text-ink">
            {content.intro}
          </p>
        </section>

        <section
          data-testid="autolyse-guide-mechanism"
          data-surface="charcoal"
          className="relative isolate overflow-hidden rounded-[2rem] bg-[#292A28] p-5 text-paper shadow-lg"
        >
          <span
            aria-hidden
            className="absolute -end-10 bottom-0 -z-10 size-36 rounded-full bg-[#F28A55]/18 blur-2xl"
          />
          <h3 className="text-heading text-paper">{content.mechanism.heading}</h3>
          <p className="mt-3 text-body leading-relaxed text-paper/72">
            {content.mechanism.body}
          </p>
        </section>

        {content.graph && (
          <section
            data-testid="autolyse-guide-graph"
            data-surface="glass"
            className="rounded-[2rem] border border-paper/55 bg-paper/30 p-5 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-heading text-ink">{content.graph.title}</h3>
              <span className="rounded-full bg-[#F28A55]/12 px-3 py-1 text-tiny font-medium text-ink-2">
                {content.graph.badge}
              </span>
            </div>
            <ConceptualGraph graph={content.graph} />
          </section>
        )}

        <RecipeContext content={content.recipeContext} recipe={recipe} />

        <div
          data-testid="autolyse-guide-practical"
          data-surface="glass"
          className="rounded-[2rem] border border-paper/55 bg-paper/30 p-5 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] backdrop-blur-sm"
        >
          {content.practicalCheck && (
            <p className="text-body leading-relaxed text-ink">
              {content.practicalCheck}
            </p>
          )}
          <p
            data-testid="autolyse-guide-inset"
            data-surface="inset"
            className="mt-4 rounded-2xl border border-ink/[0.06] bg-ink/[0.035] p-4 text-body font-semibold leading-relaxed text-ink"
          >
            {content.decisionRule}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
