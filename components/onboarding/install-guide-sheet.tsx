"use client";

import { Check, Share, SquarePlus } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { strings } from "@/lib/strings";

export interface InstallGuideSheetProps {
  open: boolean;
  onClose: () => void;
  appearance?: "default" | "home";
}

const STEPS = [
  { icon: Share, text: strings.install.guideStep1 },
  { icon: SquarePlus, text: strings.install.guideStep2 },
  { icon: Check, text: strings.install.guideStep3 },
] as const;

// iOS 16.4+ Chrome/Firefox offer "הוסף למסך הבית" from the same share menu,
// so a single instruction set covers every iOS browser.
export function InstallGuideSheet({
  open,
  onClose,
  appearance = "default",
}: InstallGuideSheetProps) {
  return (
    <BottomSheet
      open={open}
      variant={appearance === "home" ? "home" : "default"}
      onClose={onClose}
      title={strings.install.guideTitle}
    >
      <ol
        data-appearance={appearance}
        className={
          appearance === "home"
            ? "overflow-hidden rounded-[1.75rem] border border-paper/60 bg-[#FFF8F1]/75 shadow-[0_1px_0_rgba(255,255,255,0.65)] supports-[backdrop-filter]:bg-paper/40 supports-[backdrop-filter]:backdrop-blur-md [&>*+*]:border-t [&>*+*]:border-ink/[0.06]"
            : "flex flex-col gap-5 px-5 pb-10 pt-2"
        }
      >
        {STEPS.map(({ icon: Icon, text }, i) => (
          <li
            key={text}
            className={appearance === "home" ? "flex min-h-[76px] items-center gap-4 px-4 py-3" : "flex items-center gap-4"}
          >
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
