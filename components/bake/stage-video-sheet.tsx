"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import {
  buildYouTubeEmbedSrc,
  buildYouTubeWatchUrl,
  type StageVideoOrientation,
} from "@/lib/youtube";

export type { StageVideoOrientation };

export interface StageVideoSheetProps {
  open: boolean;
  onClose: () => void;
  youtubeId: string;
  orientation: StageVideoOrientation;
  caption?: string;
  watchUrl?: string;
  title?: string;
}

/** Optimistic on the server and on first paint — an offline first render would
 *  flash a failure message at a baker who is online. */
function useOnline(active: boolean): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!active) return;
    const sync = () => setOnline(navigator.onLine !== false);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, [active]);

  return online;
}

export function StageVideoSheet({
  open,
  onClose,
  youtubeId,
  orientation,
  caption,
  watchUrl,
  title,
}: StageVideoSheetProps) {
  const online = useOnline(open);

  return (
    <BottomSheet open={open} size="full" variant="pilot" title={title} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {online ? (
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-2xl bg-ink/[0.06]",
              orientation === "portrait" ? "aspect-[9/16]" : "aspect-video",
            )}
          >
            <iframe
              src={buildYouTubeEmbedSrc(youtubeId)}
              title={caption ?? strings.bake.stageVideo.playerTitle}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
          <p className="rounded-2xl bg-ink/[0.04] px-4 py-3 text-small leading-relaxed text-ink-2">
            {strings.bake.stageVideo.offline}
          </p>
        )}

        {caption && <p className="px-1 text-tiny text-ink-3">{caption}</p>}

        {/* Always present: the player can also fail silently (cross-origin block). */}
        <a
          href={watchUrl ?? buildYouTubeWatchUrl(youtubeId)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "pressable flex min-h-touch items-center gap-2 rounded-xl px-2 text-small font-medium text-ink-2",
            "transition-colors duration-fast ease-out hover:bg-ink/[0.04] hover:text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-2",
          )}
        >
          <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          {strings.bake.stageVideo.watchOnYouTube}
        </a>
      </div>
    </BottomSheet>
  );
}
