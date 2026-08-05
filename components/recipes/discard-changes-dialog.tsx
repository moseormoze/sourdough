"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DiscardChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Opt-in for redesigned screens; unconverted screens keep the old look. */
  appearance?: "default" | "ambient";
}

export function DiscardChangesDialog({
  open,
  onConfirm,
  onCancel,
  appearance = "default",
}: DiscardChangesDialogProps) {
  return (
    <Dialog
      open={open}
      appearance={appearance}
      onClose={onCancel}
      title="לבטל את השינויים?"
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            כן, חזור
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            המשך לערוך
          </Button>
        </>
      }
    />
  );
}
