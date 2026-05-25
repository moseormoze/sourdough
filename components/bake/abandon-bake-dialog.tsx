"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export interface AbandonBakeDialogProps {
  open: boolean;
  recipeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AbandonBakeDialog({
  open,
  recipeName,
  onConfirm,
  onCancel,
}: AbandonBakeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={strings.bake.abandonTitle}
      description={strings.bake.abandonDescription(recipeName)}
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            {strings.bake.abandonConfirm}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            {strings.bake.abandonCancel}
          </Button>
        </>
      }
    />
  );
}
