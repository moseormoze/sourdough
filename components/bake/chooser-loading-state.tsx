import { AMBIENT_GLASS } from "@/components/ui/ambient";

export function ChooserLoadingState() {
  return (
    <div className="grid gap-4 transition-opacity duration-base ease-out motion-reduce:transition-none max-[340px]:gap-3">
      <div aria-hidden="true" className={`min-h-[132px] ${AMBIENT_GLASS}`} />
      <div aria-hidden="true" className={`min-h-[320px] ${AMBIENT_GLASS}`} />
    </div>
  );
}
