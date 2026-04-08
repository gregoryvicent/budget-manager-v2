import type { PieDataItem } from "./PieDataItem";

/**
 * Represents a single budget category breakdown for the detail modal.
 */
export interface BreakdownCategory {
  title: string;
  items: PieDataItem[];
  referenceTotal: number;
  emptyMessage: string;
}

/**
 * Complete breakdown data for all budget categories.
 */
export interface BreakdownData {
  incomes: BreakdownCategory;
  expenses: BreakdownCategory;
  savings: BreakdownCategory;
  investments: BreakdownCategory;
}
