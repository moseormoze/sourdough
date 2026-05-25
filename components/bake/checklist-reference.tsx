import { Check } from "lucide-react";

export interface ChecklistReferenceProps {
  items: readonly string[];
  title?: string;
}

/**
 * Reference-only list. Bullets, not interactive (per QA: "the checklist
 * doesn't need to be tappable. It's just for reference"). Use this to
 * show the user what to LOOK FOR — they decide when to advance.
 */
export function ChecklistReference({
  items,
  title = "איך לדעת שזה בסדר",
}: ChecklistReferenceProps) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-2xl bg-bg-2/50 p-5">
      <h3 className="text-heading text-ink">{title}</h3>
      <ul role="list" className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-body text-ink-2">
            <Check size={16} className="text-sage-2 shrink-0 mt-1" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
