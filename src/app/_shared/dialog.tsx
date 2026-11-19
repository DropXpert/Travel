import { X } from "lucide-react";
import type { ReactNode, Ref } from "react";
import styles from "./site.module.css";

export function Dialog({ id, title, className, dialogRef, onClose, children }: {
  id: string;
  title: string;
  className?: string;
  dialogRef?: Ref<HTMLDialogElement>;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <dialog ref={dialogRef} id={id} aria-labelledby={id + "-title"} onClose={onClose} className={[styles.dialog, className].filter(Boolean).join(" ")}>
      <div className={styles.dialogHeader}>
        <h2 id={id + "-title"}>{title}</h2>
        <form method="dialog">
          <button type="submit" className={styles.iconButton} aria-label="Close">
            <X size={21} aria-hidden="true" />
          </button>
        </form>
      </div>
      {children}
    </dialog>
  );
}
