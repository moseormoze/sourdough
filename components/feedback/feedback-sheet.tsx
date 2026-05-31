"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { compressImage } from "@/lib/utils/compress-image";
import { strings } from "@/lib/strings";

type FeedbackType = "באג" | "הצעה לפיצ׳ר" | "שאלה" | "אחר";

const FEEDBACK_TYPES: FeedbackType[] = ["באג", "הצעה לפיצ׳ר", "שאלה", "אחר"];

interface FeedbackSheetProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackSheet({ open, onClose }: FeedbackSheetProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<FeedbackType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const isSubmitting = status === "submitting";
  const canSubmit = type !== null && description.trim().length > 0 && !isSubmitting;

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  function resetForm() {
    setType(null);
    setName("");
    setDescription("");
    setImagePreview(null);
    setStatus("idle");
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImagePreview(compressed);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!canSubmit || !type) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim() || undefined,
          description: description.trim(),
          imageBase64: imagePreview ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("send failed");

      toast.show(strings.feedback.successToast, { variant: "accent" });
      onClose();
      setTimeout(resetForm, 250);
    } catch {
      setStatus("error");
    }
  }

  return (
    <BottomSheet open={open} size="full" title={strings.feedback.title} onClose={handleClose}>
      <div className="flex flex-col gap-5 px-5 pb-6 pt-2">
        {/* Type selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-2">{strings.feedback.typeLabel}</span>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={[
                  "min-h-touch px-3 rounded-full text-sm font-medium border transition-colors duration-fast",
                  type === t
                    ? "bg-accent-bg text-accent border-accent"
                    : "bg-bg-2 text-ink-2 border-line",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Name (optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-2">{strings.feedback.nameLabel}</label>
          <input
            type="text"
            dir="auto"
            placeholder={strings.feedback.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        {/* Description (required) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-2">{strings.feedback.descriptionLabel}</label>
          <textarea
            dir="auto"
            rows={4}
            placeholder={strings.feedback.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-2">
          {imagePreview ? (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="max-h-32 rounded-xl object-cover" />
              <button
                type="button"
                aria-label={strings.feedback.removeImage}
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center"
              >
                <X size={12} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-touch self-start px-4 rounded-xl border border-line bg-bg-2 text-sm text-ink-2 flex items-center gap-2"
            >
              {strings.feedback.addImage}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <p className="text-sm text-danger">{strings.feedback.errorMessage}</p>
        )}

        {/* Submit */}
        <Button
          variant="accent"
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? strings.feedback.submitting : strings.feedback.submit}
        </Button>
      </div>
    </BottomSheet>
  );
}
