import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FormSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children, className, ...rest }: FormSectionProps) {
  return (
    <section className={cn("block", className)} {...rest}>
      {title && <h2 className="text-heading text-ink mb-1">{title}</h2>}
      {description && <p className="text-small text-ink-2 mb-4">{description}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
