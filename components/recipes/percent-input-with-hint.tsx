"use client";

import { useEffect, useRef, useState } from "react";
import { PercentInput, type PercentInputProps } from "./percent-input";
import { HintChip } from "./hint-chip";

export interface PercentInputWithHintProps extends PercentInputProps {
  recommended: number | null;
}

const HIGHLIGHT_MS = 600;

export function PercentInputWithHint({ recommended, ...inputProps }: PercentInputWithHintProps) {
  const [highlight, setHighlight] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleAccept() {
    if (recommended === null) return;
    inputProps.onChange(recommended);
    setHighlight(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHighlight(false), HIGHLIGHT_MS);
  }

  return (
    <div
      data-hint-highlight={highlight ? "" : undefined}
      className={
        highlight
          ? "transition-colors duration-base ease-out rounded-lg ring-2 ring-accent/30 -m-1 p-1"
          : "-m-1 p-1"
      }
    >
      <PercentInput {...inputProps} />
      {recommended !== null && (
        <div className="mt-2">
          <HintChip recommended={recommended} onAccept={handleAccept} />
        </div>
      )}
    </div>
  );
}
