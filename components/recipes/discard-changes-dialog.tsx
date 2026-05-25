"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DiscardChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardChangesDialog({
  open,
  onConfirm,
  onCancel,
}: DiscardChangesDialogProps) {
  return (
    <Dialog
      open={open}
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
