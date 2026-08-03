"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { Wheat } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";

export interface ChooserCardProps {
  name: string;
  summary: string;
  imageSrc?: string;
  mine?: boolean;
  onSelect: () => void;
}

function PlaceholderTile(): ReactNode {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-2 text-ink-3">
      <Wheat size={56} strokeWidth={1.5} />
    </div>
  );
}

export function ChooserCard({ name, summary, imageSrc, mine, onSelect }: ChooserCardProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(onSelect);

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? "" : undefined}
      data-mine={mine ? "" : undefined}
      aria-label={mine ? `${name} (${strings.bake.myBadge})` : name}
      className={cn(
        "flex flex-col w-full text-start rounded-2xl bg-paper shadow-sm overflow-hidden",
        "transition-[transform,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressed && "scale-[0.97] shadow-none"
      )}
    >
      <div className="relative aspect-[4/3] bg-bg-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover"
            priority={false}
          />
        ) : (
          <PlaceholderTile />
        )}
        {mine && (
          <span className="absolute top-2 start-2 rounded-full bg-ink/85 text-paper text-tiny font-medium px-2 py-1">
            {strings.bake.myBadge}
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-heading text-ink">{name}</h3>
        <p className="mt-1 text-small text-ink-2 line-clamp-2 min-h-[2.9em]">{summary}</p>
      </div>
    </button>
  );
}
