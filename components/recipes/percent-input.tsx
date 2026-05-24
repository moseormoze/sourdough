"use client";

import { forwardRef } from "react";
import { NumberInput, type NumberInputProps } from "@/components/ui/number-input";

export interface PercentInputProps
  extends Omit<NumberInputProps, "unit" | "step" | "min" | "max"> {
  min: number;
  max: number;
  step?: number;
}

export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  function PercentInput(props, ref) {
    return <NumberInput ref={ref} unit="%" step={props.step ?? 1} {...props} />;
  }
);
