import Image from "next/image";
import type { CSSProperties } from "react";

const CONFETTI_PIECES: ReadonlyArray<{
  left: string;
  delay: number;
  color: string;
  size: number;
  rotEnd: number;
  xEnd: number;
  yEnd: number;
}> = [
  { left: "8%", delay: 0, color: "#FFC39E", size: 8, rotEnd: 420, xEnd: -20, yEnd: 140 },
  { left: "18%", delay: 80, color: "#F5D58A", size: 6, rotEnd: -300, xEnd: 10, yEnd: 160 },
  { left: "26%", delay: 220, color: "#FFC39E", size: 10, rotEnd: 540, xEnd: -10, yEnd: 130 },
  { left: "35%", delay: 40, color: "#E8B57A", size: 7, rotEnd: -240, xEnd: 30, yEnd: 150 },
  { left: "44%", delay: 320, color: "#F5D58A", size: 9, rotEnd: 480, xEnd: -25, yEnd: 145 },
  { left: "52%", delay: 140, color: "#FFC39E", size: 6, rotEnd: 360, xEnd: 15, yEnd: 165 },
  { left: "60%", delay: 260, color: "#E8B57A", size: 8, rotEnd: -420, xEnd: -15, yEnd: 135 },
  { left: "68%", delay: 60, color: "#F5D58A", size: 7, rotEnd: 300, xEnd: 25, yEnd: 155 },
  { left: "75%", delay: 200, color: "#FFC39E", size: 9, rotEnd: -360, xEnd: -30, yEnd: 140 },
  { left: "83%", delay: 360, color: "#E8B57A", size: 6, rotEnd: 420, xEnd: 20, yEnd: 160 },
  { left: "90%", delay: 100, color: "#F5D58A", size: 8, rotEnd: -480, xEnd: -10, yEnd: 150 },
  { left: "30%", delay: 180, color: "#FFC39E", size: 5, rotEnd: 540, xEnd: 35, yEnd: 130 },
  { left: "55%", delay: 280, color: "#E8B57A", size: 7, rotEnd: -300, xEnd: -20, yEnd: 165 },
  { left: "70%", delay: 380, color: "#F5D58A", size: 9, rotEnd: 360, xEnd: 10, yEnd: 145 },
];

export function StageCelebration() {
  return (
    <section className="relative flex flex-col items-center justify-center py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
      >
        {CONFETTI_PIECES.map((p, i) => {
          const style: CSSProperties & Record<string, string | number> = {
            insetInlineStart: p.left,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--confetti-delay": `${p.delay}ms`,
            "--confetti-rot": `${p.rotEnd}deg`,
            "--confetti-x": `${p.xEnd}px`,
            "--confetti-y": `${p.yEnd}px`,
          };
          return <span key={i} className="confetti-piece absolute top-0 rounded-sm" style={style} />;
        })}
      </div>
      <div className="celebration-pop">
        <Image
          src="/icon.svg"
          alt="הלחם שלכם"
          width={220}
          height={220}
          priority
          className="h-auto w-[180px] sm:w-[220px]"
        />
      </div>
    </section>
  );
}
