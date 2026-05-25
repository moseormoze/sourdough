"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export interface StopBakeDialogProps {
  open: boolean;
  recipeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation when the user is leaving the bake entirely (from the banner).
 * "Stop the bake?" → progress lost.
 */
export function StopBakeDialog({
  open,
  recipeName,
  onConfirm,
  onCancel,
}: StopBakeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={strings.bake.stopTitle}
      description={strings.bake.stopDescription(recipeName)}
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            {strings.bake.stopConfirm}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            {strings.bake.stopCancel}
          </Button>
        </>
      }
    />
  );
}
