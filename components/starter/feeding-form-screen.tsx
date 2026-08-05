"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AMBIENT_CANVAS, AMBIENT_GLASS } from "@/components/ui/ambient";
import { TextInput } from "@/components/ui/text-input";
import { FormSection } from "@/components/ui/form-section";
import { ValidationMessage } from "@/components/ui/validation-message";
import { useToast } from "@/components/ui/toast";
import { RatioControl } from "@/components/bake/ratio-control";
import { FeedingGramsInput } from "./feeding-grams-input";
import { DeleteFeedingDialog } from "./delete-feeding-dialog";
import { DiscardChangesDialog } from "@/components/recipes/discard-changes-dialog";
import { strings } from "@/lib/strings";
import { loadIdentity } from "@/lib/storage/identity";
import { createFeeding, updateFeeding, deleteFeeding } from "@/lib/storage/feedings";
import type { FeedRatio } from "@/lib/bake-timing";
import type { FeedingInput } from "@/lib/types/feeding";
import {
  emptyFeedingFormValues,
  hasAnyError,
  validateFeeding,
  type FeedingFormValues,
} from "@/lib/validate-feeding";

export interface FeedingFormScreenProps {
  initialValues?: FeedingFormValues;
  feedingId?: string;
}

type TouchedSet = Set<string>;

function buildFedAtIso(dateStr: string, timeStr: string): string {
  const [datePart1, datePart2, datePart3] = dateStr.split("-").map(Number);
  const year = datePart1 ?? 1970;
  const month = datePart2 ?? 1;
  const day = datePart3 ?? 1;

  const now = new Date();
  const [timePart1, timePart2] =
    timeStr === "" ? [now.getHours(), now.getMinutes()] : timeStr.split(":").map(Number);
  const hours = timePart1 ?? 0;
  const minutes = timePart2 ?? 0;

  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

export function FeedingFormScreen({ initialValues, feedingId }: FeedingFormScreenProps) {
  const router = useRouter();
  const toast = useToast();
  const identity = loadIdentity();
  const s = strings.starterTracker.form;

  const initial = useMemo(() => initialValues ?? emptyFeedingFormValues(), [initialValues]);
  const [values, setValues] = useState<FeedingFormValues>(initial);
  const [touched, setTouched] = useState<TouchedSet>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = saving || deleting;

  const lastAutoRef = useRef<Record<"flourGrams" | "waterGrams", number | "">>({
    flourGrams: "",
    waterGrams: "",
  });

  function withAutoFill(next: FeedingFormValues): FeedingFormValues {
    const lastAuto = lastAutoRef.current;
    const computed: number | "" =
      next.ratio !== null && typeof next.starterGrams === "number"
        ? next.starterGrams * next.ratio
        : "";
    const result = { ...next };
    for (const key of ["flourGrams", "waterGrams"] as const) {
      const automationOwned = result[key] === "" || result[key] === lastAuto[key];
      if (automationOwned) {
        result[key] = computed;
        lastAuto[key] = computed;
      }
    }
    return result;
  }

  const errors = useMemo(() => validateFeeding(values), [values]);
  const invalid = hasAnyError(errors);
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);
  const isEdit = feedingId !== undefined;

  function touch(key: string) {
    setTouched((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  type SingleErrorKey = "ratio" | "starterGrams" | "flourGrams" | "waterGrams" | "fedAtDate" | "fedAtTime";

  function showError(key: SingleErrorKey): string | null {
    return touched.has(key) ? errors[key] : null;
  }

  const gramsErrorKey: SingleErrorKey | null = touched.has("starterGrams")
    ? "starterGrams"
    : touched.has("flourGrams")
      ? "flourGrams"
      : touched.has("waterGrams")
        ? "waterGrams"
        : null;
  const gramsError = gramsErrorKey ? errors[gramsErrorKey] : null;

  function touchGrams() {
    touch("starterGrams");
    touch("flourGrams");
    touch("waterGrams");
  }

  async function handleSubmit() {
    if (busy) return;
    setTouched(
      new Set(["ratio", "starterGrams", "flourGrams", "waterGrams", "fedAtDate", "fedAtTime"])
    );
    if (invalid || !identity) return;

    const input: FeedingInput = {
      email: identity.email,
      ratio: values.ratio as FeedRatio,
      starterGrams: values.starterGrams === "" ? null : values.starterGrams,
      flourGrams: values.flourGrams === "" ? null : values.flourGrams,
      waterGrams: values.waterGrams === "" ? null : values.waterGrams,
      fedAt: buildFedAtIso(values.fedAtDate, values.fedAtTime),
    };

    setSaving(true);
    try {
      await (feedingId ? updateFeeding(feedingId, input) : createFeeding(input));
      toast.show(s.savedToast);
      router.push("/starter");
    } catch {
      setSaving(false);
      toast.show(s.saveErrorToast, { variant: "danger" });
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

  async function handleDelete() {
    if (!feedingId || !identity || busy) return;
    setDeleteOpen(false);
    setDeleting(true);
    try {
      await deleteFeeding(feedingId, identity.email);
      toast.show(s.deletedToast);
      router.push("/starter");
    } catch {
      setDeleting(false);
      toast.show(s.deleteErrorToast, { variant: "danger" });
    }
  }

  const glassCard = `${AMBIENT_GLASS} p-5 max-[340px]:p-4`;

  return (
    <div className={`min-h-dvh ${AMBIENT_CANVAS}`}>
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip">
      <div className="flex-1 px-5 pt-[calc(20px+env(safe-area-inset-top))] pb-4 max-[340px]:px-4">
      <header className="relative z-10 flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          iconStart={<ChevronRight size={20} aria-hidden />}
        >
          {s.backToList}
        </Button>
      </header>

      <h1 className="text-display-md text-ink mb-6">{isEdit ? s.editTitle : s.addTitle}</h1>

      <div className="flex flex-col gap-4">
        <div data-surface="glass" className={glassCard}>
          <RatioControl
            value={values.ratio as FeedRatio}
            onChange={(r) => {
              setValues(withAutoFill({ ...values, ratio: r }));
              touch("ratio");
            }}
          />
          <ValidationMessage message={showError("ratio")} />
        </div>

        <FormSection data-surface="glass" className={glassCard} title={s.gramsSectionTitle}>
          <FeedingGramsInput
            value={{
              starterGrams: values.starterGrams,
              flourGrams: values.flourGrams,
              waterGrams: values.waterGrams,
            }}
            onChange={(next) => {
              const merged = { ...values, ...next };
              setValues(
                next.starterGrams !== values.starterGrams ? withAutoFill(merged) : merged
              );
              touchGrams();
            }}
          />
          <ValidationMessage message={gramsError} />
        </FormSection>

        <div data-surface="glass" className={`${glassCard} flex flex-col gap-4`}>
          <TextInput
            type="date"
            appearance="inset"
            label={s.dateLabel}
            value={values.fedAtDate}
            onChange={(e) => setValues({ ...values, fedAtDate: e.target.value })}
            onBlur={() => touch("fedAtDate")}
            error={showError("fedAtDate")}
          />

          <TextInput
            type="time"
            appearance="inset"
            label={s.timeLabel}
            value={values.fedAtTime}
            onChange={(e) => setValues({ ...values, fedAtTime: e.target.value })}
            onBlur={() => touch("fedAtTime")}
            error={showError("fedAtTime")}
          />
        </div>
      </div>
      </div>

      <div className="sticky bottom-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-ink/[0.06] bg-[#FFF8F1]/90 supports-[backdrop-filter]:bg-paper/60 supports-[backdrop-filter]:backdrop-blur-md max-[340px]:px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={busy || (touched.size > 0 && invalid)}
            className="shrink-0"
          >
            {s.saveButton}
          </Button>
          <Button variant="ghost" onClick={handleCancel} disabled={busy} className="shrink-0">
            {s.cancelButton}
          </Button>
          {isEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              loading={deleting}
              disabled={busy}
              iconStart={<Trash2 size={16} aria-hidden />}
              className="ms-auto shrink-0 text-danger hover:bg-danger-bg"
            >
              {s.deleteButton}
            </Button>
          )}
        </div>
      </div>

      {isEdit && (
        <DeleteFeedingDialog
          open={deleteOpen}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}

      <DiscardChangesDialog
        open={discardOpen}
        appearance="ambient"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardOpen(false)}
      />
    </main>
    </div>
  );
}
