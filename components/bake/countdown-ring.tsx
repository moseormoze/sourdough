"use client";

import { useId } from "react";
import { strings } from "@/lib/strings";

interface CountdownRingProps {
  secondsLeft: number;
  durationSeconds: number;
  formattedTime: string;
  status: string;
}

const SIZE = 216;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CountdownRing({
  secondsLeft,
  durationSeconds,
  formattedTime,
  status,
}: CountdownRingProps) {
  const gradientId = `autolyse-ring-${useId().replace(/:/g, "")}`;
  const remainingRatio = Math.max(
    0,
    Math.min(1, durationSeconds > 0 ? secondsLeft / durationSeconds : 0)
  );

  return (
    <div className="relative mx-auto size-[216px]" dir="ltr">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 size-full -rotate-90 overflow-visible"
        role="progressbar"
        aria-label={strings.bake.autolyseTimer.timeRemaining}
        aria-valuemin={0}
        aria-valuemax={durationSeconds}
        aria-valuenow={Math.ceil(secondsLeft)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="52%" stopColor="#F3D8B7" />
            <stop offset="100%" stopColor="var(--sage)" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,.10)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - remainingRatio)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-small font-medium text-paper/60" dir="rtl">
          {status}
        </span>
        <span
          className={`num mt-2 font-mono font-semibold leading-none tabular-nums text-paper ${
            formattedTime.length > 5 ? "text-[2rem]" : "text-[2.75rem]"
          }`}
        >
          {formattedTime}
        </span>
        <span className="mt-2 text-tiny font-medium text-paper/45" dir="rtl">
          {strings.bake.autolyseTimer.timeRemaining}
        </span>
      </div>
    </div>
  );
}
