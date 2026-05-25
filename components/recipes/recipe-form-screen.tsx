"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { FormSection } from "@/components/ui/form-section";
import { FlourBreakdownInput } from "./flour-breakdown-input";
import { PercentInputWithHint } from "./percent-input-with-hint";
import { TempInput } from "./temp-input";
import { hintFor } from "@/lib/recommendations";
import { strings } from "@/lib/strings";
import {
  emptyRecipeFormValues,
  hasAnyError,
  validateRecipe,
  type RecipeFormValues,
} from "@/lib/validate-recipe";

export interface RecipeFormScreenProps {
  initialValues?: RecipeFormValues;
  recipeId?: string;
  onSubmit?: (values: RecipeFormValues, recipeId: string | undefined) => void;
}

type TouchedSet = Set<string>;

export function RecipeFormScreen({
  initialValues,
  recipeId,
  onSubmit,
}: RecipeFormScreenProps) {
  const router = useRouter();
  const [values, setValues] = useState<RecipeFormValues>(
    () => initialValues ?? emptyRecipeFormValues()
  );
  const [touched, setTouched] = useState<TouchedSet>(new Set());

  const errors = useMemo(() => validateRecipe(values), [values]);
  const invalid = hasAnyError(errors);

  function touch(key: string) {
    setTouched((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function showError(key: keyof typeof errors): string | null {
    return touched.has(key) ? errors[key] : null;
  }

  function handleSubmit() {
    setTouched(
      new Set(["name", "flour", "hydration", "salt", "levain", "kitchenTemp"])
    );
    if (invalid) return;
    onSubmit?.(values, recipeId);
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
          {strings.recipes.backToHome}
        </Button>
      </header>

      <h1 className="text-display-md text-ink mb-6">
        {recipeId ? values.name || strings.form.nameLabel : strings.form.nameLabel}
      </h1>

      <div className="flex flex-col gap-6">
        <TextInput
          label={strings.form.nameLabel}
          placeholder={strings.form.namePlaceholder}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={() => touch("name")}
          error={showError("name")}
        />

        <FlourBreakdownInput
          value={values.flour}
          onChange={(flour) => setValues({ ...values, flour })}
          onBlurField={() => touch("flour")}
          error={showError("flour")}
        />

        <FormSection>
          <PercentInputWithHint
            label={strings.form.hydration}
            min={50}
            max={100}
            value={values.hydration}
            onChange={(v) => setValues({ ...values, hydration: v })}
            onBlur={() => touch("hydration")}
            error={showError("hydration")}
            recommended={hintFor("hydration", values.hydration, values.flour)}
          />
          <PercentInputWithHint
            label={strings.form.salt}
            min={0}
            max={5}
            step={0.1}
            value={values.salt}
            onChange={(v) => setValues({ ...values, salt: v })}
            onBlur={() => touch("salt")}
            error={showError("salt")}
            recommended={hintFor("salt", values.salt, values.flour)}
          />
          <PercentInputWithHint
            label={strings.form.levain}
            min={0}
            max={40}
            value={values.levain}
            onChange={(v) => setValues({ ...values, levain: v })}
            onBlur={() => touch("levain")}
            error={showError("levain")}
            recommended={hintFor("levain", values.levain, values.flour)}
          />
          <TempInput
            label={strings.form.kitchenTemp}
            value={values.kitchenTemp}
            onChange={(v) => setValues({ ...values, kitchenTemp: v })}
            onBlur={() => touch("kitchenTemp")}
            error={showError("kitchenTemp")}
          />
        </FormSection>

        {/* Inclusions section is added in T9 */}
      </div>

      <div className="mt-10 flex gap-3">
        <Button variant="accent" onClick={handleSubmit} disabled={touched.size > 0 && invalid}>
          {strings.form.saveButton}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          {strings.form.cancelButton}
        </Button>
      </div>
    </main>
  );
}
