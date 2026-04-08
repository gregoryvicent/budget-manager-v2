"use client";

import Modal from "@/components/Modal";
import BreakdownDonut from "@/components/BreakdownDonut";
import { SPACING } from "@/lib/theme";
import type { DetailModalProps } from "./types/DetailModalProps";

/**
 * Modal that displays individual breakdown cards for each budget category.
 * Each card contains a donut chart with a progress-bar legend.
 * Categories stack vertically for a clean, scannable layout.
 *
 * @param {DetailModalProps} props - Modal state, breakdown data, and trigger ref.
 */
export default function DetailModal({ open, onClose, breakdownData, triggerRef }: DetailModalProps) {
  const categories = [
    breakdownData.incomes,
    breakdownData.expenses,
    breakdownData.savings,
    breakdownData.investments,
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Desglose de Distribución"
      maxWidth="720px"
      triggerRef={triggerRef}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: SPACING["4"] }}>
        {categories.map((cat) => (
          <BreakdownDonut
            key={cat.title}
            title={cat.title}
            items={cat.items}
            referenceTotal={cat.referenceTotal}
            emptyMessage={cat.emptyMessage}
          />
        ))}
      </div>
    </Modal>
  );
}
