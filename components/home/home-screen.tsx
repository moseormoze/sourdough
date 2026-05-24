"use client";

import { useEffect, useState } from "react";
import { Wheat, BookOpen } from "lucide-react";
import { HomeCta } from "./home-cta";
import { listRecipes } from "@/lib/storage/recipes";

export function HomeScreen() {
  const [recipeCount, setRecipeCount] = useState<number | null>(null);

  useEffect(() => {
    setRecipeCount(listRecipes().length);
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-16 pb-10">
      <header className="text-center mb-12">
        <h1 className="text-display-lg font-display text-ink">כיכר</h1>
        <p className="mt-2 text-body-lg text-ink-2">מה אופים היום?</p>
      </header>

      <div className="flex flex-col gap-4">
        <HomeCta
          variant="primary"
          href="/bake/new"
          icon={<Wheat size={28} />}
          label="התחל אפייה"
        />
        <HomeCta
          variant="secondary"
          href="/recipes"
          icon={<BookOpen size={24} />}
          label="המתכונים שלי"
          count={recipeCount ?? undefined}
        />
      </div>
    </main>
  );
}
