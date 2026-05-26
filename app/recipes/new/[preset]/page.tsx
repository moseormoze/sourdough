import { notFound } from "next/navigation";
import { RecipeFormScreen } from "@/components/recipes/recipe-form-screen";
import { getPreset } from "@/lib/presets";
import { emptyRecipeFormValues, type RecipeFormValues } from "@/lib/validate-recipe";

interface PageProps {
  params: Promise<{ preset: string }>;
}

export default async function Page({ params }: PageProps) {
  const { preset } = await params;

  let initialValues: RecipeFormValues;

  if (preset === "scratch") {
    initialValues = emptyRecipeFormValues();
  } else {
    const found = getPreset(preset);
    if (!found) notFound();
    initialValues = {
      name: found.name,
      flour: { ...found.data.flour },
      flourWeightGrams: found.data.flourWeightGrams ?? 500,
      hydration: found.data.hydration,
      salt: found.data.salt,
      levain: found.data.levain,
      kitchenTemp: found.data.kitchenTemp,
      inclusions: found.data.inclusions.map((i) => ({ ...i })),
    };
  }

  return <RecipeFormScreen initialValues={initialValues} />;
}
