"use client";

import { useState, useEffect, useCallback } from "react";
import { buildHistoryChartData } from "@/lib/buildHistoryChartData";
import type { MonthlySummary, HistoryChartEntry } from "@/lib/types/budgetHistory";

interface UseBudgetHistoryState {
  chartData: HistoryChartEntry[];
  availableYears: number[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Fetches budget history for a given year and transforms it into chart-ready data.
 * Also retrieves available years from the user's existing budget months.
 *
 * @param {number} year - Calendar year to fetch history for.
 * @returns {UseBudgetHistoryState} Chart data, available years, loading/error states, and retry handler.
 */
export function useBudgetHistory(year: number): UseBudgetHistoryState {
  const [chartData, setChartData] = useState<HistoryChartEntry[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch history and all budgets in parallel
      const [historyRes, budgetsRes] = await Promise.all([
        fetch(`/api/budgets/history?year=${year}`),
        fetch("/api/budgets"),
      ]);

      if (!historyRes.ok) {
        const data = await historyRes.json();
        throw new Error(data.error || "Error al cargar el historial.");
      }

      const summaries: MonthlySummary[] = await historyRes.json();
      setChartData(buildHistoryChartData(summaries, year));

      // Extract unique years from all budget months
      if (budgetsRes.ok) {
        const budgets: { year: number }[] = await budgetsRes.json();
        const years = [...new Set(budgets.map((b) => b.year))].sort((a, b) => b - a);
        setAvailableYears(years);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    load();
  }, [load]);

  return { chartData, availableYears, loading, error, retry: load };
}
