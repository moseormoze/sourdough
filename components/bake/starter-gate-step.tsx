"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

interface StarterGateStepProps {
  onReady: () => void;
  onNotReady: () => void;
}

export function StarterGateStep({ onReady, onNotReady }: StarterGateStepProps) {
  const s = strings.starterGate;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-label text-ink-3 mb-1">{s.gateTitle}</p>
        <h2 className="text-display-sm text-ink">{s.gateQuestion}</h2>
      </div>

      <div className="rounded-2xl overflow-hidden bg-paper border border-line">
        <div className="relative h-44 w-full">
          <Image
            src="/stages/1-levain.png"
            alt="שאור פעיל בצנצנת — מבעבע, הוכפל בנפח, גומייה מסמנת את גובה ההתחלה"
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>
        <p className="px-4 py-3 text-body text-ink-2">{s.gateEducationBlurb}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="accent" className="w-full" onClick={onReady}>
          {s.gateCta_yes}
        </Button>
        <Button variant="soft" className="w-full" onClick={onNotReady}>
          {s.gateCta_no}
        </Button>
      </div>
    </div>
  );
}
