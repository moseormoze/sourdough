import { notFound } from "next/navigation";
import { RecipeFormScreen } from "@/components/recipes/recipe-form-screen";
import { getPreset } from "@/lib/presets";
import { emptyRecipeFormValues, type RecipeFormValues } from "@/lib/validate-recipe";

interface PageProps {
  params: Promise<{ preset: string }>;
  searchParams: Promise<{ returnToBake?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { preset } = await params;
  const { returnToBake } = await searchParams;

  let initialValues: RecipeFormValues;

  if (preset === "scratch") {
    initialValues = emptyRecipeFormValues();
  } else {
    const found = getPreset(preset);
    if (!found) notFound();
    initialValues = {
      name: found.name,
      flour: {
        white: found.data.flour.white,
        wholeWheat: found.data.flour.wholeWheat,
        rye: found.data.flour.rye,
        speltWhite: found.data.flour.speltWhite ?? 0,
        speltWhole: found.data.flour.speltWhole ?? 0,
        other: found.data.flour.other ?? 0,
      },
      flourWeightGrams: found.data.flourWeightGrams ?? 500,
      hydration: found.data.hydration,
      salt: found.data.salt,
      levain: found.data.levain,
      kitchenTemp: found.data.kitchenTemp,
      inclusions: found.data.inclusions.map((i) => ({ ...i })),
    };
  }

  return <RecipeFormScreen initialValues={initialValues} returnToBake={returnToBake === "1"} />;
}
