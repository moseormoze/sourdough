import { Fragment } from "react";
import { cn } from "@/lib/cn";

export interface SummaryPart {
  value: string;
  label: string;
}

interface SummaryFlour {
  white: number;
  wholeWheat: number;
  rye: number;
  speltWhite?: number;
  speltWhole?: number;
}

export function summarizeRecipe(recipe: {
  flour: SummaryFlour;
  hydration: number;
}): SummaryPart[] {
  const { white, wholeWheat, rye } = recipe.flour;
  const speltWhite = recipe.flour.speltWhite ?? 0;
  const speltWhole = recipe.flour.speltWhole ?? 0;
  const parts: SummaryPart[] = [];
  if (white >= 100) parts.push({ value: "100%", label: "לבן" });
  else if (wholeWheat >= 100) parts.push({ value: "100%", label: "מלא" });
  else if (rye >= 100) parts.push({ value: "100%", label: "שיפון" });
  else if (speltWhole >= 100) parts.push({ value: "100%", label: "כוסמין מלא" });
  else if (speltWhite >= 100) parts.push({ value: "100%", label: "כוסמין לבן" });
  else if (wholeWheat > 0) parts.push({ value: `${wholeWheat}%`, label: "מלא" });
  else if (rye > 0) parts.push({ value: `${rye}%`, label: "שיפון" });
  else if (speltWhole > 0) parts.push({ value: `${speltWhole}%`, label: "כוסמין מלא" });
  else if (speltWhite > 0) parts.push({ value: `${speltWhite}%`, label: "כוסמין לבן" });
  else if (white > 0) parts.push({ value: `${white}%`, label: "לבן" });
  parts.push({ value: `${recipe.hydration}%`, label: "הידרציה" });
  return parts;
}

export function RecipeSummary({
  parts,
  className,
}: {
  parts: SummaryPart[];
  className?: string;
}) {
  return (
    <span className={cn("block", className)}>
      {parts.map((part, index) => (
        <Fragment key={`${part.value}-${part.label}`}>
          {index > 0 && " · "}
          <span dir="ltr" className="num">
            {part.value}
          </span>{" "}
          {part.label}
        </Fragment>
      ))}
    </span>
  );
}
