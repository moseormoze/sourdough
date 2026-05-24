"use client";

import { forwardRef } from "react";
import { NumberInput, type NumberInputProps } from "@/components/ui/number-input";

export interface TempInputProps
  extends Omit<NumberInputProps, "unit" | "step" | "min" | "max"> {
  min?: number;
  max?: number;
  step?: number;
}

export const TempInput = forwardRef<HTMLInputElement, TempInputProps>(function TempInput(
  { min = 10, max = 40, step = 1, ...rest },
  ref
) {
  return <NumberInput ref={ref} unit="°C" step={step} min={min} max={max} {...rest} />;
});
