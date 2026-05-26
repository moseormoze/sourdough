import Image from "next/image";

export interface StageMediaProps {
  imageUrl?: string;
  imageAlt?: string;
  youtubeId?: string;
  videoCaption?: string;
}

function buildYouTubeEmbedSrc(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "1",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function StageMedia({ imageUrl, imageAlt, youtubeId, videoCaption }: StageMediaProps) {
  if (!imageUrl && !youtubeId) return null;
  return (
    <section className="flex flex-col gap-3">
      {imageUrl && (
        <div className="overflow-hidden rounded-2xl bg-paper shadow-sm">
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
      {youtubeId && (
        <div className="overflow-hidden rounded-2xl bg-paper shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              src={buildYouTubeEmbedSrc(youtubeId)}
              title={videoCaption ?? "סרטון הדגמה"}
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
    </section>
  );
}
