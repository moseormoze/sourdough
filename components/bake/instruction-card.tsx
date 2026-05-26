import { Fragment, type ReactNode } from "react";
import type { BakeQuantities } from "@/lib/bake-math";

export interface InstructionCardProps {
  steps: string[];
  tip?: string;
  title?: string;
  quantities?: BakeQuantities;
}

type TokenMap = Record<string, number>;

function buildTokenMap(q: BakeQuantities): TokenMap {
  return {
    starterGrams: q.levainBuild.starterGrams,
    levainWaterGrams: q.levainBuild.waterGrams,
    levainFlourGrams: q.levainBuild.flourGrams,
    totalFlourGrams: q.totalFlourGrams,
    autolyseWaterGrams: q.mixAdditions.waterGrams,
    levainTotalGrams: q.levainTotalGrams,
    saltGrams: q.saltGrams,
    saltReserveWaterGrams: q.mixAdditions.saltReserveWaterGrams,
  };
}

function renderStep(text: string, tokens: TokenMap | null): ReactNode {
  if (!tokens) return text;
  const parts: ReactNode[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const tokenName = match[1];
    const value = tokenName !== undefined ? tokens[tokenName] : undefined;
    if (value !== undefined) {
      parts.push(
        <strong key={match.index} className="font-semibold text-ink">
          {value}g
        </strong>
      );
    } else {
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

export function InstructionCard({
  steps,
  tip,
  title = "מה לעשות",
  quantities,
}: InstructionCardProps) {
  const tokens = quantities ? buildTokenMap(quantities) : null;
  return (
    <section className="rounded-2xl bg-paper shadow-sm p-5">
      <h3 className="text-heading text-ink">{title}</h3>
      <ol className="mt-3 flex flex-col gap-2.5 text-body-lg text-ink leading-relaxed list-decimal ps-6 marker:text-ink-2 marker:font-semibold">
        {steps.map((step, i) => (
          <li key={i} className="ps-1">
            {renderStep(step, tokens)}
          </li>
        ))}
      </ol>
      {tip && (
        <aside className="mt-4 rounded-xl bg-bg/60 border border-line p-3.5">
          <p className="text-small text-ink-2 leading-relaxed">
            <span className="font-semibold text-ink">טיפ: </span>
            {tip}
          </p>
        </aside>
      )}
    </section>
  );
}
