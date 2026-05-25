"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { FormSection } from "@/components/ui/form-section";
import { useToast } from "@/components/ui/toast";
import { FlourBreakdownInput } from "./flour-breakdown-input";
import { PercentInputWithHint } from "./percent-input-with-hint";
import { TempInput } from "./temp-input";
import { InclusionsSection } from "./inclusions-section";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { DiscardChangesDialog } from "./discard-changes-dialog";
import { hintFor } from "@/lib/recommendations";
import { strings } from "@/lib/strings";
import { saveRecipe, deleteRecipe } from "@/lib/storage/recipes";
import type { RecipeInput } from "@/lib/types/recipe";
import {
  emptyRecipeFormValues,
  hasAnyError,
  validateRecipe,
  type RecipeFormValues,
} from "@/lib/validate-recipe";

export interface RecipeFormScreenProps {
  initialValues?: RecipeFormValues;
  recipeId?: string;
  /** When provided, replaces the built-in save (used in tests / future integrations). */
  onSubmit?: (values: RecipeFormValues, recipeId: string | undefined) => void;
}

type TouchedSet = Set<string>;

function formValuesToInput(values: RecipeFormValues, recipeId?: string): RecipeInput {
  return {
    id: recipeId,
    name: values.name.trim(),
    flour: {
      white: values.flour.white === "" ? 0 : values.flour.white,
      wholeWheat: values.flour.wholeWheat === "" ? 0 : values.flour.wholeWheat,
      rye: values.flour.rye === "" ? 0 : values.flour.rye,
      other: values.flour.other === "" ? 0 : values.flour.other,
    },
    hydration: values.hydration === "" ? 0 : values.hydration,
    salt: values.salt === "" ? 0 : values.salt,
    levain: values.levain === "" ? 0 : values.levain,
    kitchenTemp: values.kitchenTemp === "" ? 25 : values.kitchenTemp,
    inclusions: values.inclusions.map((i) => ({
      name: i.name.trim(),
      amountGrams: typeof i.amountGrams === "number" ? i.amountGrams : 0,
    })),
  };
}

export function RecipeFormScreen({
  initialValues,
  recipeId,
  onSubmit,
}: RecipeFormScreenProps) {
  const router = useRouter();
  const toast = useToast();

  const initial = useMemo(
    () => initialValues ?? emptyRecipeFormValues(),
    [initialValues]
  );
  const [values, setValues] = useState<RecipeFormValues>(initial);
  const [touched, setTouched] = useState<TouchedSet>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const errors = useMemo(() => validateRecipe(values), [values]);
  const invalid = hasAnyError(errors);
  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial]
  );
  const isEdit = recipeId !== undefined;

  function touch(key: string) {
    setTouched((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  type SingleErrorKey =
    | "name"
    | "flour"
    | "hydration"
    | "salt"
    | "levain"
    | "kitchenTemp";

  function showError(key: SingleErrorKey): string | null {
    return touched.has(key) ? errors[key] : null;
  }

  function handleSubmit() {
    const allTouched = new Set([
      "name",
      "flour",
      "hydration",
      "salt",
      "levain",
      "kitchenTemp",
    ]);
    values.inclusions.forEach((_, i) => {
      allTouched.add(`inclusion-${i}-name`);
      allTouched.add(`inclusion-${i}-amountGrams`);
    });
    setTouched(allTouched);
    if (invalid) return;

    if (onSubmit) {
      onSubmit(values, recipeId);
      return;
    }

    try {
      saveRecipe(formValuesToInput(values, recipeId));
      toast.show("המתכון נשמר");
      router.push("/recipes");
    } catch {
      toast.show("לא הצלחנו לשמור — נסה שוב", { variant: "danger" });
    }
  }

  function handleCancel() {
    if (dirty) {
      setDiscardOpen(true);
    } else {
      router.back();
    }
  }

  function handleConfirmDiscard() {
    setDiscardOpen(false);
    router.back();
  }

  function handleDelete() {
    if (!recipeId) return;
    try {
      deleteRecipe(recipeId);
      setDeleteOpen(false);
      toast.show(`"${values.name}" נמחק`);
      router.push("/recipes");
    } catch {
      setDeleteOpen(false);
      toast.show("לא הצלחנו למחוק — נסה שוב", { variant: "danger" });
    }
  }

  function handleTouchInclusion(rowIndex: number, field: "name" | "amountGrams") {
    touch(`inclusion-${rowIndex}-${field}`);
  }

  const inclusionShowErrors = values.inclusions.map(
    (_, i) =>
      touched.has(`inclusion-${i}-name`) || touched.has(`inclusion-${i}-amountGrams`)
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-10">
      <header className="relative z-10 flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {strings.recipes.backToHome}
        </Button>
      </header>

      <h1 className="text-display-md text-ink mb-6">
        {isEdit ? values.name || strings.form.nameLabel : strings.form.nameLabel}
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

        <InclusionsSection
          value={values.inclusions}
          onChange={(inclusions) => setValues({ ...values, inclusions })}
          errors={errors.inclusions}
          showErrors={inclusionShowErrors}
          onTouchField={handleTouchInclusion}
        />
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={touched.size > 0 && invalid}
          >
            {strings.form.saveButton}
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            {strings.form.cancelButton}
          </Button>
        </div>
        {isEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            iconStart={<Trash2 size={16} aria-hidden />}
            className="self-start text-danger hover:bg-danger-bg"
          >
            מחק מתכון
          </Button>
        )}
      </div>

      {isEdit && (
        <DeleteConfirmDialog
          open={deleteOpen}
          recipeName={values.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}

      <DiscardChangesDialog
        open={discardOpen}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardOpen(false)}
      />
    </main>
  );
}
