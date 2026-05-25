"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmDialogProps {
  open: boolean;
  recipeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  recipeName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={`למחוק את "${recipeName}"?`}
      description="הפעולה לא ניתנת לביטול"
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            מחק
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
        </>
      }
    />
  );
}
