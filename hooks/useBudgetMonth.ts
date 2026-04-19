"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { CacheContext } from "@/contexts/CacheContext";

interface BudgetMonthState {
    budgetMonthId: string | null;
    loading: boolean;
    error: string | null;
}

/**
 * Gets or creates the budget month for the authenticated user.
 * The userId is extracted from the session on the server side.
 * Re-fetches automatically when year or month changes.
 *
 * @param {number} year - Budget year.
 * @param {number} month - Budget month (1-12).
 * @returns {BudgetMonthState} Budget month ID and loading state.
 */
export const useBudgetMonth = (year: number, month: number): BudgetMonthState => {
    const [budgetMonthId, setBudgetMonthId] = useState<string | null>(null);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState<string | null>(null);
    const cacheCtx = useContext(CacheContext);
    const fetchFn = cacheCtx?.cachedFetch ?? fetch;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setBudgetMonthId(null);
        try {
            const res = await fetchFn("/api/budgets/get-or-create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year, month }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error al cargar presupuesto.");
            setBudgetMonthId(data.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido.");
        } finally {
            setLoading(false);
        }
    }, [year, month, fetchFn]);

    useEffect(() => { load(); }, [load]);

    return { budgetMonthId, loading, error };
};
