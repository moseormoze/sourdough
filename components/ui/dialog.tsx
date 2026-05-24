"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, actions, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

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
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "bg-transparent p-0 outline-none",
        "backdrop:bg-ink/45",
        "open:animate-[dialog-in_200ms_cubic-bezier(0.22,1,0.36,1)]"
      )}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-desc" : undefined}
    >
      <div
        className={cn(
          "bg-paper rounded-2xl shadow-lg",
          "min-w-[280px] max-w-[420px] w-[90vw]",
          "p-6",
          className
        )}
      >
        <h2 id="dialog-title" className="text-display-sm text-ink">
          {title}
        </h2>
        {description && (
          <p id="dialog-desc" className="mt-2 text-body-lg text-ink-2">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {actions && <div className="mt-6 flex flex-row-reverse gap-3">{actions}</div>}
      </div>
    </dialog>
  );
}
