"use client";

import { useState } from "react";
import Image from "next/image";
import { Wheat } from "lucide-react";
import { cn } from "@/lib/cn";
import { AMBIENT_GLASS } from "@/components/ui/ambient";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { RecipeSummary, type SummaryPart } from "./recipe-summary";

export interface ChooserCardProps {
  name: string;
  summary: SummaryPart[];
  imageSrc?: string;
  onSelect: () => void;
}

function PlaceholderTile() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-ink/[0.04] text-ink-3"
    >
      <Wheat size={56} strokeWidth={1.5} />
    </div>
  );
}

export function ChooserCard({ name, summary, imageSrc, onSelect }: ChooserCardProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(onSelect);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageSrc !== undefined && !imageFailed;

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? "" : undefined}
      aria-label={name}
      className={cn(
        `flex h-full w-full flex-col overflow-hidden text-start ${AMBIENT_GLASS}`,
        "transition-[transform,box-shadow] duration-fast ease-out motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-2",
        pressed && "scale-[0.97] shadow-none",
      )}
    >
      <span className="relative block aspect-[4/3] w-full bg-ink/[0.04]">
        {showImage ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover"
            priority={false}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <PlaceholderTile />
        )}
      </span>
      <span className="flex flex-1 flex-col p-4 max-[340px]:p-3">
        <span className="block text-heading text-ink [overflow-wrap:anywhere]">{name}</span>
        <RecipeSummary
          parts={summary}
          className="mt-1 text-small text-ink-2 [overflow-wrap:anywhere]"
        />
      </span>
    </button>
  );
}
