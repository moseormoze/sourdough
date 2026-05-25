"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BakeStubScreen() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
      <header className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          חזרה
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center -mt-16">
        <h1 className="text-display-md font-display text-ink">מצב אפייה — בקרוב</h1>
        <p className="mt-3 max-w-xs text-body-lg text-ink-2">
          הזרימה הזאת תיכנס בקרוב. בינתיים, תכין את המתכונים שלך.
        </p>
      </div>
    </main>
  );
}
