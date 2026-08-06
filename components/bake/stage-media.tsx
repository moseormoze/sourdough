"use client";

import Image from "next/image";
import { strings } from "@/lib/strings";
import { buildYouTubeEmbedSrc } from "@/lib/youtube";
import { StageVideoCard } from "./stage-video-card";
import type { StageVideoOrientation } from "./stage-video-sheet";

export interface StageMediaProps {
  imageUrl?: string;
  imageAlt?: string;
  youtubeId?: string;
  videoCaption?: string;
  /** Card label for a portrait asset; ignored in landscape. */
  videoLabel?: string;
  youtubeOrientation?: StageVideoOrientation;
  /**
   * Portrait only. The sheet is owned by the screen, not by this component, so
   * media stays presentational. This started as a layering workaround — mounted
   * from here the sheet landed under the feedback FAB's stacking context — but
   * `BottomSheet` now portals to <body>, so that reason no longer holds.
   */
  onOpenVideo?: () => void;
}

export function StageMedia({
  imageUrl,
  imageAlt,
  youtubeId,
  videoCaption,
  videoLabel,
  youtubeOrientation = "landscape",
  onOpenVideo,
}: StageMediaProps) {
  if (!imageUrl && !youtubeId) return null;

  const portrait = youtubeId !== undefined && youtubeOrientation === "portrait";

  return (
    <section className="flex flex-col gap-3">
      {imageUrl && (
        <div className="overflow-hidden rounded-2xl bg-ink/[0.04]">
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            width={1456}
            height={819}
            className="h-auto w-full"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>
      )}
      {youtubeId && !portrait && (
        <div className="overflow-hidden rounded-2xl bg-ink/[0.04]">
          <div className="relative aspect-video w-full">
            <iframe
              src={buildYouTubeEmbedSrc(youtubeId)}
              title={videoCaption ?? strings.bake.stageVideo.playerTitle}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {videoCaption && (
            <p className="px-4 py-2 text-tiny text-ink-3 leading-relaxed">{videoCaption}</p>
          )}
        </div>
      )}
      {portrait && (
        <StageVideoCard
          label={videoLabel ?? strings.bake.stageVideo.playerTitle}
          caption={videoCaption}
          onOpen={() => onOpenVideo?.()}
        />
      )}
    </section>
  );
}
