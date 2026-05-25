"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export interface ReplaceBakeDialogProps {
  open: boolean;
  recipeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation when the user tries to start a NEW bake while another is active.
 * Used from the chooser. "Replace bake?" → current one ends, new starts.
 */
export function ReplaceBakeDialog({
  open,
  recipeName,
  onConfirm,
  onCancel,
}: ReplaceBakeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={strings.bake.replaceTitle}
      description={strings.bake.replaceDescription(recipeName)}
      actions={
        <>
          <Button variant="warn" onClick={onConfirm}>
            {strings.bake.replaceConfirm}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            {strings.bake.replaceCancel}
          </Button>
        </>
      }
    />
  );
}
