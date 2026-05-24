"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ToastVariant = "neutral" | "accent" | "danger";

export interface ToastOptions {
  variant?: ToastVariant;
  action?: { label: string; onPress: () => void };
  durationMs?: number;
}

interface ActiveToast extends Required<Omit<ToastOptions, "action">> {
  id: number;
  message: string;
  action: ToastOptions["action"];
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 2400;
const ACTION_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCounter = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback<ToastContextValue["show"]>((message, options) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const next: ActiveToast = {
      id: ++idCounter.current,
      message,
      variant: options?.variant ?? "neutral",
      action: options?.action,
      durationMs:
        options?.durationMs ?? (options?.action ? ACTION_DURATION_MS : DEFAULT_DURATION_MS),
    };
    setToast(next);
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === next.id ? null : current));
      timerRef.current = null;
    }, next.durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toast={toast} onAction={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const variantClasses: Record<ToastVariant, string> = {
  neutral: "bg-ink text-paper",
  accent: "bg-accent text-paper",
  danger: "bg-danger text-paper",
};

function ToastViewport({ toast, onAction }: { toast: ActiveToast | null; onAction: () => void }) {
  if (!toast) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-6 z-toast flex justify-center px-4 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <div
        className={cn(
          "pointer-events-auto inline-flex items-center gap-3 rounded-full shadow-lg",
          "ps-5 pe-2 py-2 max-w-[90vw]",
          "animate-[toast-in_200ms_cubic-bezier(0.22,1,0.36,1)]",
          variantClasses[toast.variant]
        )}
      >
        <span className="text-body-lg">{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onPress();
              onAction();
            }}
            className="ms-2 min-h-touch px-4 rounded-full text-body-lg font-medium bg-paper/10 hover:bg-paper/20 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
