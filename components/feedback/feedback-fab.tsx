"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { strings } from "@/lib/strings";
import { FeedbackSheet } from "./feedback-sheet";

export function FeedbackFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const pointer = useRef({
    startX: 0,
    startY: 0,
    active: false,
    suppressClick: false,
  });

  function beginPress(event: React.PointerEvent<HTMLButtonElement>) {
    pointer.current = {
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      suppressClick: false,
    };
    setIsPressed(true);
  }

  function movePress(event: React.PointerEvent<HTMLButtonElement>) {
    if (!pointer.current.active) return;
    const dx = Math.abs(event.clientX - pointer.current.startX);
    const dy = Math.abs(event.clientY - pointer.current.startY);
    if (dx <= 5 && dy <= 5) return;
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setIsPressed(false);
  }

  function releasePress() {
    pointer.current.active = false;
    setIsPressed(false);
  }

  function cancelPress() {
    pointer.current.active = false;
    pointer.current.suppressClick = true;
    setIsPressed(false);
  }

  function activate(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.detail !== 0 && pointer.current.suppressClick) {
      pointer.current.suppressClick = false;
      event.preventDefault();
      return;
    }
    pointer.current.suppressClick = false;
    setOpen(true);
  }

  if (/^\/bake\/stage\/2\/?$/.test(pathname)) return null;

  return (
    <>
      <button
        data-manual-press="true"
        type="button"
        aria-label={strings.feedback.fabLabel}
        className="fixed bottom-[88px] start-4 z-fab w-11 h-11 rounded-full bg-paper shadow-md text-ink-2 flex items-center justify-center transition-[transform,background-color] duration-fast ease-out"
        style={isPressed ? { transform: "scale(0.965)", backgroundColor: "rgba(0,0,0,0.06)" } : undefined}
        onPointerDown={beginPress}
        onPointerMove={movePress}
        onPointerUp={releasePress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onBlur={cancelPress}
        onClick={activate}
      >
        <MessageSquare size={18} aria-hidden />
      </button>
      <FeedbackSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
