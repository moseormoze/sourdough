"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresetCard } from "./preset-card";
import { PRESETS, type Preset } from "@/lib/presets";

export function PresetGalleryScreen() {
  const router = useRouter();

  function handleSelect(preset: Preset) {
    router.push(`/recipes/new/${preset.id}`);
  }

  function handleStartFromScratch() {
    router.push(`/recipes/new/scratch`);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          חזרה
        </Button>
      </header>

      <h1 className="text-display-md text-ink mb-6">מאיפה להתחיל?</h1>

      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((p) => (
          <PresetCard key={p.id} preset={p} onSelect={handleSelect} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="ghost" onClick={handleStartFromScratch}>
          התחל מאפס
        </Button>
      </div>
    </main>
  );
}
