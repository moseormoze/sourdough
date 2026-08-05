// Shared ambient-surface class recipes (Discovery 22 visual language).
// Constants only — a shared component is considered only after a third screen.
export const AMBIENT_CANVAS =
  "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]";

export const AMBIENT_GLASS =
  "rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md";

// Charcoal (#292A28, F28) — the screen's single primary action and selected
// states (tonal-inversion selection per the rollout language spec). The top
// sheen gradient sits over the background-color so hover shifts still apply.
export const AMBIENT_CHARCOAL =
  "bg-[#292A28] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0)_60%)] text-paper";

// Frosted pill — unselected choices and inset fields on glass.
export const AMBIENT_PILL = "bg-paper/70";

export const AMBIENT_CHARCOAL_SHADOW =
  "shadow-[0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(41,42,40,0.22)]";
