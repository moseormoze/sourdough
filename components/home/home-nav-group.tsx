import type { ReactNode } from "react";
import { AMBIENT_GLASS } from "@/components/ui/ambient";

export function HomeNavGroup({ children }: { children: ReactNode }) {
  return (
    <nav
      className={`overflow-hidden ${AMBIENT_GLASS} [&>*+*]:border-t [&>*+*]:border-ink/[0.06]`}
    >
      {children}
    </nav>
  );
}
