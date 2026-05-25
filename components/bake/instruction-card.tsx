export interface InstructionCardProps {
  text: string;
  title?: string;
}

export function InstructionCard({ text, title = "מה לעשות" }: InstructionCardProps) {
  return (
    <section className="rounded-2xl bg-paper shadow-sm p-5">
      <h3 className="text-heading text-ink">{title}</h3>
      <p className="mt-2 text-body-lg text-ink whitespace-pre-line leading-relaxed">{text}</p>
    </section>
  );
}
