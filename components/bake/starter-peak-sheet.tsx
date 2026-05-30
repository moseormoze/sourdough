import Image from "next/image";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { strings } from "@/lib/strings";

interface StarterPeakSheetProps {
  open: boolean;
  onClose: () => void;
}

const sg = strings.starterGate;
const SIGNS = [sg.peakSign1, sg.peakSign2, sg.peakSign3, sg.peakSign4] as const;

export function StarterPeakSheet({ open, onClose }: StarterPeakSheetProps) {
  return (
    <BottomSheet open={open} size="peek" title={sg.peakSheetTitle} onClose={onClose}>
      <div className="relative w-full rounded-xl overflow-hidden mb-4" style={{ height: 180 }}>
        <Image
          src="/stages/starter-peak-comparison.jpg"
          alt={sg.peakImageAlt}
          fill
          className="object-cover"
        />
      </div>
      <ul className="flex flex-col gap-2 pb-2">
        {SIGNS.map((sign, i) => (
          <li key={i} className="flex items-start gap-2 text-body text-ink">
            <span className="text-accent shrink-0 mt-0.5" aria-hidden>•</span>
            <span>{sign}</span>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
