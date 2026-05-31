"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { strings } from "@/lib/strings";
import { FeedbackSheet } from "./feedback-sheet";

export function FeedbackFab() {
  const [open, setOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={strings.feedback.fabLabel}
        className="fixed bottom-[88px] start-4 z-fab w-11 h-11 rounded-full bg-paper shadow-md text-ink-2 flex items-center justify-center transition-[transform,background-color] duration-fast ease-out"
        style={isPressed ? { transform: "scale(0.965)", backgroundColor: "rgba(0,0,0,0.06)" } : undefined}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
        onClick={() => setOpen(true)}
      >
        <MessageSquare size={18} aria-hidden />
      </button>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
