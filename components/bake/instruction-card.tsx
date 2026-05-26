export interface InstructionCardProps {
  steps: string[];
  tip?: string;
  title?: string;
}

export function InstructionCard({ steps, tip, title = "מה לעשות" }: InstructionCardProps) {
  return (
    <section className="rounded-2xl bg-paper shadow-sm p-5">
      <h3 className="text-heading text-ink">{title}</h3>
      <ol className="mt-3 flex flex-col gap-2.5 text-body-lg text-ink leading-relaxed list-decimal ps-6 marker:text-ink-2 marker:font-semibold">
        {steps.map((step, i) => (
          <li key={i} className="ps-1">
            {step}
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
