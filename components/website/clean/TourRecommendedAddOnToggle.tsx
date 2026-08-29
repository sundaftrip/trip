"use client";

import { formatCurrency } from "@/lib/utils";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import styles from "./CleanSite.module.css";

export default function TourRecommendedAddOnToggle({
  compact = false,
  grouped = false,
}: {
  compact?: boolean;
  grouped?: boolean;
}) {
  const {
    selectableAddOn,
    includeSelectableAddOn,
    setIncludeSelectableAddOn,
  } = useTourRoomSelection();

  if (!selectableAddOn) return null;

  return (
    <label
      className={styles.detailRecommendedAddOn}
      data-compact={compact || undefined}
      data-grouped={grouped || undefined}
      data-included={includeSelectableAddOn}
    >
      <span className={styles.detailRecommendedAddOnCopy}>
        <strong>{selectableAddOn.name}</strong>
        <small><span>DIREKOMENDASIKAN</span> · +{formatCurrency(selectableAddOn.price)}</small>
      </span>
      <span className={styles.detailRecommendedAddOnAction}>
        <span aria-hidden="true">
          {includeSelectableAddOn ? "Termasuk" : "Tidak termasuk"}
        </span>
        <span className={styles.detailRecommendedAddOnSwitch}>
          <input
            type="checkbox"
            checked={includeSelectableAddOn}
            onChange={(event) => setIncludeSelectableAddOn(event.target.checked)}
            aria-label="Sertakan asuransi perjalanan"
          />
          <span aria-hidden="true" />
        </span>
      </span>
    </label>
  );
}
