"use client";

import { useEffect, useRef, useCallback, useState, useId } from "react";

export interface BottomSheetProps {
  open: boolean;
  size?: "peek" | "full";
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const DISMISS_THRESHOLD = 80; // px
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EXIT_MS = 200;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } catch {
      // environment doesn't support matchMedia
    }
  }, []);
  return reduced;
}

export function BottomSheet({
  open,
  size = "peek",
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const drag = useRef<{ startY: number; startTime: number } | null>(null);
  const titleId = useId();

  // Mount/unmount with animation gate
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        if (triggerRef.current instanceof HTMLElement) {
          triggerRef.current.focus();
          triggerRef.current = null;
        }
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Body scroll lock while mounted
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Focus trap + Escape
  useEffect(() => {
    if (!visible || !panelRef.current) return;
    const panel = panelRef.current;

    const getFocusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = getFocusables();
      if (!els.length) return;
      const first = els[0]!;
      const last = els[els.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: e.clientY, startTime: Date.now() };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setDragOffset(Math.max(0, e.clientY - drag.current.startY));
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      const dy = Math.max(0, e.clientY - drag.current.startY);
      const elapsed = Math.max(1, Date.now() - drag.current.startTime);
      drag.current = null;
      setDragOffset(0);
      if (dy >= DISMISS_THRESHOLD || dy / elapsed > 0.5) {
        onClose();
      } else {
        setSnapping(true);
        setTimeout(() => setSnapping(false), 250);
      }
    },
    [onClose],
  );

  if (!mounted) return null;

  const heightClass = size === "full" ? "h-[88svh]" : "h-[56svh]";

  const panelStyle: React.CSSProperties = reducedMotion
    ? { opacity: visible ? 1 : 0, transition: "opacity 150ms ease" }
    : {
        transform:
          dragOffset > 0
            ? `translateY(${dragOffset}px)`
            : visible
              ? "translateY(0)"
              : "translateY(100%)",
        transition:
          dragOffset > 0
            ? "none"
            : snapping
              ? `transform 250ms ${SPRING}`
              : visible
                ? `transform 300ms ${SPRING}`
                : `transform ${EXIT_MS}ms ease-in`,
      };

  return (
    <div className="fixed inset-0 z-sheet">
      {/* Scrim */}
      <div
        className="absolute inset-0 backdrop-blur-[2px] transition-opacity"
        style={{
          backgroundColor: "rgba(31,26,20,0.45)",
          opacity: visible ? 1 : 0,
          transitionDuration: reducedMotion ? "150ms" : "200ms",
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`absolute bottom-0 start-0 end-0 ${heightClass}
                   bg-paper rounded-t-3xl shadow-sheet
                   flex flex-col overflow-hidden will-change-transform`}
        style={panelStyle}
      >
        {/* Drag handle — pointer capture enables drag-dismiss from here */}
        <div
          className="flex justify-center pt-3 pb-2 shrink-0 touch-none cursor-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-9 h-1 rounded-full bg-line" aria-hidden />
        </div>

        {/* Header: title + close button */}
        <div className="flex items-center justify-between px-5 pb-4 shrink-0">
          {title
            ? <h2 id={titleId} className="text-heading text-ink">{title}</h2>
            : <span />
          }
          <button
            type="button"
            aria-label="סגור"
            onClick={onClose}
            className="pressable min-h-touch min-w-touch flex items-center justify-center
                       text-ink-3 hover:text-ink -me-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
