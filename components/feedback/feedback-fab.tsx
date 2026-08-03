"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";
import { FeedbackSheet } from "./feedback-sheet";

export function FeedbackFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isPressed, pressProps } = usePressActivation<HTMLButtonElement>(
    () => setOpen(true),
  );

  if (/^\/bake\/stage\/2\/?$/.test(pathname)) return null;

  return (
    <>
      <button
        data-manual-press="true"
        type="button"
        aria-label={strings.feedback.fabLabel}
        className="fixed bottom-[88px] start-4 z-fab w-11 h-11 rounded-full bg-paper shadow-md text-ink-2 flex items-center justify-center transition-[transform,background-color] duration-fast ease-out"
        style={isPressed ? { transform: "scale(0.965)", backgroundColor: "rgba(0,0,0,0.06)" } : undefined}
        {...pressProps}
      >
        <MessageSquare size={18} aria-hidden />
      </button>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
