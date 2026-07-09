"use client";

import { useState } from "react";
import { Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { durationRangeLabel, fermentationStageSecs } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import type { Flour } from "@/lib/types/recipe";

export interface DoughTempCardProps {
  doughTempC: number | null;
  kitchenTempC: number;
  flour: Flour;
  baseSecs: number;
  onChange: (tempC: number | null) => void;
}

const MIN_C = 18;
const MAX_C = 35;
// Below this gap between the two estimates, "earlier/later" is noise.
const HINT_THRESHOLD_MINS = 20;

const t = strings.bake.doughTemp;

export function DoughTempCard({
  doughTempC,
  kitchenTempC,
  flour,
  baseSecs,
  onChange,
}: DoughTempCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number | "">(kitchenTempC);

  const draftValid = typeof draft === "number" && draft >= MIN_C && draft <= MAX_C;
  const draftError =
    typeof draft === "number" && !draftValid ? t.rangeError : null;

  function openEditor() {
    setDraft(doughTempC ?? kitchenTempC);
    setEditing(true);
  }

  function save() {
    if (!draftValid) return;
    onChange(draft as number);
    setEditing(false);
  }

  function remove() {
    onChange(null);
    setEditing(false);
  }

  const shadow = (() => {
    if (doughTempC === null) return null;
    const shadowSecs = fermentationStageSecs(baseSecs, doughTempC, flour);
    const officialSecs = fermentationStageSecs(baseSecs, kitchenTempC, flour);
    const deltaMins = (officialSecs - shadowSecs) / 60;
    const hint =
      deltaMins >= HINT_THRESHOLD_MINS
        ? t.hintEarly
        : deltaMins <= -HINT_THRESHOLD_MINS
          ? t.hintLater
          : t.hintSimilar;
    return { rangeLabel: durationRangeLabel(shadowSecs), hint };
  })();

  return (
    <section
      aria-label={t.fieldLabel}
      className="rounded-2xl border border-line bg-paper p-4 shadow-sm transition-[height] duration-base ease-in-out"
    >
      {editing ? (
        <div className="flex flex-col gap-3">
          <NumberInput
            label={t.fieldLabel}
            unit="°C"
            value={draft}
            onChange={setDraft}
            step={0.5}
            min={MIN_C}
            max={MAX_C}
            error={draftError}
          />
          <div className="flex items-center gap-2">
            <Button variant="accent" size="sm" onClick={save} disabled={!draftValid}>
              {t.save}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              {t.cancel}
            </Button>
            {doughTempC !== null && (
              <Button variant="ghost" size="sm" onClick={remove}>
                {t.remove}
              </Button>
            )}
          </div>
        </div>
      ) : shadow ? (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
            <Thermometer size={20} />
          </span>
          <p className="flex-1 text-small leading-relaxed text-ink">
            {t.shadowPrefix(String(doughTempC))}
            <strong className="font-semibold">{shadow.rangeLabel}</strong>
            {" — "}
            {shadow.hint} <span className="text-ink-2">{t.signsRule}</span>
          </p>
          <button
            type="button"
            onClick={openEditor}
            className="pressable min-h-touch shrink-0 px-2 text-tiny text-ink-3 hover:text-ink transition-colors"
          >
            {t.edit}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-accent" aria-hidden>
            <Thermometer size={20} />
          </span>
          <p className="flex-1 text-small text-ink-2">{t.prompt}</p>
          <Button variant="ghost" size="sm" onClick={openEditor}>
            {t.measured}
          </Button>
        </div>
      )}
    </section>
  );
}
