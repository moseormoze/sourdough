import { strings } from "@/lib/strings";

const AUTOLYSE_VIDEO_SRC =
  "https://www.youtube-nocookie.com/embed/8PpC8eZPTgY?playsinline=1&rel=0";

export function AutolyseCalibration() {
  const copy = strings.bake.stageKnowledge.calibration;
  const playerTitle = `${copy.before} ${copy.after}`;

  return (
    <figure
      data-testid="autolyse-calibration"
      className="rounded-2xl border border-line/70 bg-bg-2/35 p-4"
    >
      <div className="mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-xl bg-ink-1">
        <iframe
          src={AUTOLYSE_VIDEO_SRC}
          title={playerTitle}
          loading="lazy"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>
      <div className="mt-3 grid gap-2">
        <p className="rounded-xl bg-paper/70 px-3 py-2.5 text-small leading-relaxed text-ink-2">
          {copy.before}
        </p>
        <p className="rounded-xl bg-paper/70 px-3 py-2.5 text-small leading-relaxed text-ink-2">
          {copy.after}
        </p>
      </div>
      <figcaption className="mt-3 text-tiny leading-relaxed text-ink-3">
        {copy.caveat}
      </figcaption>
    </figure>
  );
}
