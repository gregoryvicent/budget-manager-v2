"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { AlertContext } from "@/contexts/AlertContext";
import { CacheContext } from "@/contexts/CacheContext";

export type CopyCategory = "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE";

export interface SourceMonth {
  budgetMonthId: string;
  year: number;
  month: number;
  label: string;
}

export interface CopyableItem {
  id: string;
  name: string;
  amount: number;
}

export interface UseCopyItemsState {
  availableMonths: SourceMonth[];
  loadingMonths: boolean;
  sourceItems: CopyableItem[];
  loadingItems: boolean;
  isCopying: boolean;
  error: string | null;
  loadItemsForMonth: (budgetMonthId: string) => Promise<void>;
  executeCopy: (selectedItemIds: string[]) => Promise<boolean>;
  reset: () => void;
}

/**
 * Returns a Set with all item IDs selected (select all).
 *
 * @param {CopyableItem[]} items - The list of copyable items.
 * @returns {Set<string>} A set containing every item ID.
 */
export function selectAllItems(items: CopyableItem[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

/**
 * Returns an empty Set (deselect all).
 *
 * @returns {Set<string>} An empty set.
 */
export function deselectAllItems(): Set<string> {
  return new Set<string>();
}

/**
 * Returns the initial selection state: all items preselected.
 *
 * @param {CopyableItem[]} items - The list of copyable items.
 * @returns {Set<string>} A set containing every item ID.
 */
export function initialSelection(items: CopyableItem[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

/**
 * Computes the selection summary: count of selected items and total amount.
 *
 * @param {CopyableItem[]} items - All available copyable items.
 * @param {Set<string>} selectedIds - Set of selected item IDs.
 * @returns {{ count: number; totalAmount: number }} The selection summary.
 */
export function computeSelectionSummary(
  items: CopyableItem[],
  selectedIds: Set<string>,
): { count: number; totalAmount: number } {
  let count = 0;
  let totalAmount = 0;
  for (const item of items) {
    if (selectedIds.has(item.id)) {
      count++;
      totalAmount += item.amount;
    }
  }
  return { count, totalAmount };
}

/** Spanish month names for readable labels. */
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Formats a year and month into a readable Spanish label.
 *
 * @param {number} year - The year.
 * @param {number} month - The month (1-12).
 * @returns {string} Formatted label, e.g. "Junio 2025".
 */
export function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * Filters and sorts available source months for copying.
 * Excludes the target month and months with no items in the category.
 * Sorts from most recent to oldest.
 *
 * @param {Array<{ id: string; year: number; month: number }>} budgets - All user budgets.
 * @param {string} targetBudgetMonthId - The current target month to exclude.
 * @param {Map<string, number>} itemCounts - Map of budgetMonthId to item count in category.
 * @returns {SourceMonth[]} Filtered and sorted source months.
 */
export function filterAvailableMonths(
  budgets: Array<{ id: string; year: number; month: number }>,
  targetBudgetMonthId: string,
  itemCounts: Map<string, number>,
): SourceMonth[] {
  return budgets
    .filter(b => b.id !== targetBudgetMonthId && (itemCounts.get(b.id) ?? 0) > 0)
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .map(b => ({
      budgetMonthId: b.id,
      year: b.year,
      month: b.month,
      label: formatMonthLabel(b.year, b.month),
    }));
}

/**
 * Returns the API endpoint path for fetching items of a given category.
 *
 * @param {CopyCategory} category - The item category.
 * @param {string} budgetMonthId - The budget month ID.
 * @returns {string} The API URL path.
 */
function getItemsEndpoint(category: CopyCategory, budgetMonthId: string): string {
  if (category === "INCOME") {
    return `/api/income-entries?budgetMonthId=${budgetMonthId}`;
  }
  const type = category === "FIXED_EXPENSE" ? "FIXED" : "VARIABLE";
  return `/api/expense-entries?budgetMonthId=${budgetMonthId}&type=${type}`;
}

/**
 * Hook that manages the copy-items-between-months workflow.
 * Loads available source months, items for a selected month, and executes the copy.
 *
 * @param {string | null} budgetMonthId - Target budget month ID.
 * @param {number} selectedYear - Target year.
 * @param {number} selectedMonth - Target month (1-12).
 * @param {CopyCategory} category - Item category to copy.
 * @returns {UseCopyItemsState} State and actions for the copy workflow.
 */
export const useCopyItems = (
  budgetMonthId: string | null,
  selectedYear: number,
  selectedMonth: number,
  category: CopyCategory,
): UseCopyItemsState => {
  const [availableMonths, setAvailableMonths] = useState<SourceMonth[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [sourceItems, setSourceItems] = useState<CopyableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const alertCtx = useContext(AlertContext);
  const cacheCtx = useContext(CacheContext);
  const fetchFn = cacheCtx?.cachedFetch ?? fetch;

  // Load available months when the hook initializes or params change
  const loadMonths = useCallback(async () => {
    if (!budgetMonthId) return;
    setLoadingMonths(true);
    setError(null);
    try {
      const res = await fetchFn("/api/budgets");
      const budgets: Array<{ id: string; year: number; month: number }> = await res.json();
      if (!res.ok) throw new Error("Error al cargar meses disponibles.");

      // For each budget (excluding target), check if it has items in the category
      const otherBudgets = budgets.filter(b => b.id !== budgetMonthId);
      const itemCounts = new Map<string, number>();

      const countPromises = otherBudgets.map(async (b) => {
        try {
          const itemRes = await fetchFn(getItemsEndpoint(category, b.id));
          if (itemRes.ok) {
            const items: unknown[] = await itemRes.json();
            itemCounts.set(b.id, items.length);
          }
        } catch {
          // Skip months that fail to load
        }
      });
      await Promise.all(countPromises);

      const filtered = filterAvailableMonths(budgets, budgetMonthId, itemCounts);
      setAvailableMonths(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar meses disponibles.");
    } finally {
      setLoadingMonths(false);
    }
  }, [budgetMonthId, category, fetchFn]);

  useEffect(() => { loadMonths(); }, [loadMonths]);

  /**
   * Loads items from a selected source month.
   *
   * @param {string} sourceBudgetMonthId - The source budget month ID.
   */
  const loadItemsForMonth = useCallback(async (sourceBudgetMonthId: string) => {
    setLoadingItems(true);
    setError(null);
    setSelectedSourceId(sourceBudgetMonthId);
    try {
      const res = await fetchFn(getItemsEndpoint(category, sourceBudgetMonthId));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar ítems.");
      const items: CopyableItem[] = data.map((item: { id: string; name: string; amount: number }) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
      }));
      setSourceItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar ítems del mes seleccionado.");
      setSourceItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [category, fetchFn]);

  /**
   * Executes the copy operation for the selected items.
   *
   * @param {string[]} selectedItemIds - IDs of items to copy.
   * @returns {Promise<boolean>} True if copy succeeded, false otherwise.
   */
  const executeCopy = useCallback(async (selectedItemIds: string[]): Promise<boolean> => {
    if (isCopying || !budgetMonthId || !selectedSourceId) return false;
    setIsCopying(true);
    setError(null);
    try {
      const res = await fetchFn("/api/bulk-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": generateIdempotencyKey(),
        },
        body: JSON.stringify({
          sourceBudgetMonthId: selectedSourceId,
          targetBudgetMonthId: budgetMonthId,
          category,
          itemIds: selectedItemIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al copiar ítems.");

      const count = data.count ?? selectedItemIds.length;
      alertCtx?.addAlert({
        variant: "success",
        message: `${count} ítem${count !== 1 ? "s" : ""} copiado${count !== 1 ? "s" : ""} correctamente.`,
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al copiar ítems.";
      alertCtx?.addAlert({ variant: "error", message: msg });
      setError(msg);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [isCopying, budgetMonthId, selectedSourceId, category, fetchFn, alertCtx]);

  /** Resets all internal state. Called when the modal closes. */
  const reset = useCallback(() => {
    setAvailableMonths([]);
    setSourceItems([]);
    setLoadingMonths(false);
    setLoadingItems(false);
    setIsCopying(false);
    setError(null);
    setSelectedSourceId(null);
  }, []);

  return {
    availableMonths,
    loadingMonths,
    sourceItems,
    loadingItems,
    isCopying,
    error,
    loadItemsForMonth,
    executeCopy,
    reset,
  };
};
