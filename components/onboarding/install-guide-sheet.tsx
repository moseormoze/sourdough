"use client";

import { Check, Share, SquarePlus } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { strings } from "@/lib/strings";

export interface InstallGuideSheetProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: Share, text: strings.install.guideStep1 },
  { icon: SquarePlus, text: strings.install.guideStep2 },
  { icon: Check, text: strings.install.guideStep3 },
] as const;

// iOS 16.4+ Chrome/Firefox offer "הוסף למסך הבית" from the same share menu,
// so a single instruction set covers every iOS browser.
export function InstallGuideSheet({ open, onClose }: InstallGuideSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={strings.install.guideTitle}>
      <ol className="flex flex-col gap-5 px-5 pb-10 pt-2">
        {STEPS.map(({ icon: Icon, text }, i) => (
          <li key={text} className="flex items-center gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent"
              aria-hidden
            >
              <Icon size={20} />
            </span>
            <span className="text-body text-ink leading-relaxed">
              <span className="num font-semibold me-1.5" dir="ltr">
                {i + 1}.
              </span>
              {text}
            </span>
          </li>
        ))}
      </ol>
    </BottomSheet>
  );
}
