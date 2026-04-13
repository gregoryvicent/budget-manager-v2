/**
 * Shared type definitions for the Budget History feature.
 *
 * These interfaces are used across the backend use case, API endpoint,
 * custom hook, and chart components.
 */

/**
 * Aggregated monthly summary returned by the Budget History API.
 *
 * Represents the total income and expenses for a specific month/year,
 * calculated from the associated IncomeEntry and ExpenseEntry records.
 *
 * @example
 * const summary: MonthlySummary = {
 *   year: 2024,
 *   month: 3,
 *   totalIncome: 5000,
 *   totalExpenses: 3200,
 * };
 */
export interface MonthlySummary {
  /** Calendar year (e.g. 2024). */
  year: number;
  /** Month number, 1-12 (January = 1, December = 12). */
  month: number;
  /** Sum of all IncomeEntry amounts for this month. */
  totalIncome: number;
  /** Sum of all ExpenseEntry amounts (FIXED + VARIABLE) for this month. */
  totalExpenses: number;
}

/**
 * Data entry formatted for the history bar chart component.
 *
 * Produced by `buildHistoryChartData` from an array of `MonthlySummary`.
 * Each entry maps to one month on the chart's X axis.
 *
 * @example
 * const entry: HistoryChartEntry = {
 *   month: 1,
 *   monthLabel: "Ene",
 *   income: 4500,
 *   expenses: 2800,
 * };
 */
export interface HistoryChartEntry {
  /** Month number, 1-12 (January = 1, December = 12). */
  month: number;
  /** Abbreviated month label in Spanish (e.g. "Ene", "Feb", "Dic"). */
  monthLabel: string;
  /** Total income for the month. */
  income: number;
  /** Total expenses for the month. */
  expenses: number;
}
