"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export interface DeleteFeedingDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteFeedingDialog({ open, onConfirm, onCancel }: DeleteFeedingDialogProps) {
  const s = strings.starterTracker.deleteDialog;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={s.title}
      description={s.description}
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            {s.confirm}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            {s.cancel}
          </Button>
        </>
      }
    />
  );
}
