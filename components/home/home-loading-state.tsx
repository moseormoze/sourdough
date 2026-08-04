export function HomeLoadingState() {
  return (
    <div className="grid gap-4 transition-opacity duration-base ease-out motion-reduce:transition-none max-[340px]:gap-3">
      <div
        aria-hidden="true"
        className="min-h-[216px] rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md"
      />
      <div
        aria-hidden="true"
        className="min-h-[128px] rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md"
      />
    </div>
  );
}
