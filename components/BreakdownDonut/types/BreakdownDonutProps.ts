import type { PieDataItem } from "@/components/DistributionChart/types/PieDataItem";

/**
 * Props for the BreakdownDonut component.
 *
 * @param {string} title - Category title displayed above the donut chart
 * @param {PieDataItem[]} items - Data items to render as donut slices
 * @param {number} referenceTotal - Total used to calculate relative percentages
 * @param {string} emptyMessage - Placeholder text shown when items is empty
 */
export interface BreakdownDonutProps {
  title: string;
  items: PieDataItem[];
  referenceTotal: number;
  emptyMessage: string;
}
