/** Landscape assets embed in the page flow; portrait ones open in a sheet. */
export type StageVideoOrientation = "landscape" | "portrait";

export function buildYouTubeEmbedSrc(id: string): string {
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

export function buildYouTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
