import { AMBIENT_GLASS } from "@/components/ui/ambient";

export function HomeLoadingState() {
  return (
    <div className="grid gap-4 transition-opacity duration-base ease-out motion-reduce:transition-none max-[340px]:gap-3">
      <div aria-hidden="true" className={`min-h-[216px] ${AMBIENT_GLASS}`} />
      <div aria-hidden="true" className={`min-h-[128px] ${AMBIENT_GLASS}`} />
    </div>
  );
}
