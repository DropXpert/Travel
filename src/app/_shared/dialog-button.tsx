"use client";

import type { MouseEvent, ReactNode } from "react";

export function DialogButton({ dialogId, className, label, children }: {
  dialogId: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  function openDialog(event: MouseEvent<HTMLButtonElement>) {
    const dialog = document.getElementById(dialogId);
    if (dialog instanceof HTMLDialogElement) {
      event.currentTarget.closest("dialog")?.close();
      dialog.showModal();
    }
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={openDialog}
    >
      {children}
    </button>
  );
}
