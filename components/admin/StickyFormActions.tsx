"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import styles from "./AdminWorkspace.module.css";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  primaryLabel: string;
  cancelHref?: string;
  cancelLabel?: string;
  onSave?: () => void;
}

export default function StickyFormActions({
  loading = false,
  disabled = false,
  loadingLabel = "Menyimpan...",
  primaryLabel,
  cancelHref,
  cancelLabel = "Batal",
  onSave,
}: Props) {
  return (
    <div className={styles.saveBar}>
      <div className={styles.saveActions}>
        {cancelHref && (
          <Link
            href={cancelHref}
            className={styles.secondaryButton}
          >
            {cancelLabel}
          </Link>
        )}
        <button
          type={onSave ? "button" : "submit"}
          onClick={onSave}
          disabled={loading || disabled}
          aria-busy={loading}
          className={styles.primaryButton}
        >
          <Save size={16} aria-hidden="true" />
          {loading ? loadingLabel : primaryLabel}
        </button>
      </div>
    </div>
  );
}
