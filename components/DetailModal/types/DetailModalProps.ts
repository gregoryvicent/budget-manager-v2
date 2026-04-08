import type { BreakdownData } from "@/components/DistributionChart/types/BreakdownData";
import type { RefObject } from "react";

/**
 * Props for the DetailModal component.
 *
 * @param {boolean} open - Whether the modal is visible.
 * @param {() => void} onClose - Callback invoked when the modal should close.
 * @param {BreakdownData} breakdownData - Breakdown data for all budget categories.
 * @param {RefObject<HTMLElement | null>} [triggerRef] - Element to return focus to on close.
 */
export interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  breakdownData: BreakdownData;
  triggerRef?: RefObject<HTMLElement | null>;
}
