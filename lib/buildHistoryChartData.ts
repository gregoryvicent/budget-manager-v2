import type { MonthlySummary, HistoryChartEntry } from "@/lib/types/budgetHistory";

/** Abbreviated month labels in Spanish, indexed 0-11. */
const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

/**
 * Transforms an array of monthly summaries into 12 chart entries (one per month),
 * filling months without data with zero values.
 *
 * @param summaries - Array of aggregated monthly summaries from the API.
 * @param year - The calendar year being displayed (used for context; summaries should already be filtered).
 * @returns An array of exactly 12 HistoryChartEntry objects ordered January–December.
 */
export function buildHistoryChartData(
  summaries: MonthlySummary[],
  year: number,
): HistoryChartEntry[] {
  const lookup = new Map<number, MonthlySummary>();
  for (const s of summaries) {
    lookup.set(s.month, s);
  }

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const summary = lookup.get(month);
    return {
      month,
      monthLabel: MONTH_LABELS[i],
      income: summary?.totalIncome ?? 0,
      expenses: summary?.totalExpenses ?? 0,
    };
  });
}
