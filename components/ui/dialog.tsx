"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  appearance?: "default" | "ambient";
  onAfterClose?: () => void;
}

const AMBIENT_EXIT_MS = 200;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  className,
  appearance = "default",
  onAfterClose,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (open) {
      node.removeAttribute("data-leaving");
      if (!node.open) node.showModal();
      return;
    }

    if (!node.open) return;

    const finishClose = () => {
      closeTimerRef.current = null;
      node.removeAttribute("data-leaving");
      if (node.open) node.close();
      onAfterClose?.();
    };

    if (appearance === "ambient" && !prefersReducedMotion()) {
      node.setAttribute("data-leaving", "true");
      closeTimerRef.current = setTimeout(finishClose, AMBIENT_EXIT_MS);
    } else {
      finishClose();
    }
  }, [appearance, onAfterClose, open]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handleClose = () => {
      if (open) onClose();
    };
    node.addEventListener("close", handleClose);
    return () => node.removeEventListener("close", handleClose);
  }, [open, onClose]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      ref={ref}
      data-appearance={appearance}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "bg-transparent p-0 outline-none transition-opacity duration-base data-[leaving=true]:opacity-0",
        appearance === "ambient" ? "backdrop:bg-ink/35 backdrop:backdrop-blur-sm" : "backdrop:bg-ink/45",
        "open:animate-[dialog-in_200ms_cubic-bezier(0.22,1,0.36,1)]",
      )}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        className={cn(
          appearance === "ambient"
            ? "rounded-[2rem] border border-paper/70 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_20px_55px_rgba(41,42,40,0.18)] supports-[backdrop-filter]:bg-paper/65 supports-[backdrop-filter]:backdrop-blur-xl"
            : "rounded-2xl bg-paper shadow-lg",
          "min-w-[280px] max-w-[420px] w-[90vw]",
          appearance === "ambient" ? "max-h-[calc(100dvh-2rem)] overflow-y-auto p-5" : "p-6",
          className
        )}
      >
        <h2 id={titleId} className="text-display-sm text-ink">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-body-lg text-ink-2">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {actions && (
          <div className={cn("mt-6 gap-3", appearance === "ambient" ? "grid" : "flex flex-row-reverse")}>
            {actions}
          </div>
        )}
      </div>
    </dialog>
  );
}
