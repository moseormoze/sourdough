import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface ValidationMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  message: string | null | undefined;
}

export function ValidationMessage({ message, className, id, ...rest }: ValidationMessageProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn("mt-2 text-small text-danger", className)}
      {...rest}
    >
      {message}
    </p>
  );
}
