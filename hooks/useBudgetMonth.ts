"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * In-memory map that caches budgetMonthId by "year-month" key.
 * Persists across re-renders since useBudgetMonth uses POST (not cached by CacheContext).
 */
const budgetMonthCache = new Map<string, string>();

interface BudgetMonthState {
    budgetMonthId: string | null;
    loading: boolean;
    error: string | null;
}

/**
 * Gets or creates the budget month for the authenticated user.
 * The userId is extracted from the session on the server side.
 * Re-fetches automatically when year or month changes.
 * Caches budgetMonthId locally so returning to a previously visited month is instant.
 *
 * @param {number} year - Budget year.
 * @param {number} month - Budget month (1-12).
 * @returns {BudgetMonthState} Budget month ID and loading state.
 */
export const useBudgetMonth = (year: number, month: number): BudgetMonthState => {
    const cacheKey = `${year}-${month}`;
    const cached = budgetMonthCache.get(cacheKey) ?? null;

    const [budgetMonthId, setBudgetMonthId] = useState<string | null>(cached);
    const [loading, setLoading]             = useState(!cached);
    const [error, setError]                 = useState<string | null>(null);
    const prevKeyRef = useRef(cacheKey);

    const load = useCallback(async () => {
        const key = `${year}-${month}`;
        const hit = budgetMonthCache.get(key);
        if (hit) {
            setBudgetMonthId(hit);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/budgets/get-or-create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year, month }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error al cargar presupuesto.");
            budgetMonthCache.set(key, data.id);
            setBudgetMonthId(data.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido.");
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    // When year/month changes, immediately set cached value (or null) before fetching
    useEffect(() => {
        const key = `${year}-${month}`;
        if (prevKeyRef.current !== key) {
            prevKeyRef.current = key;
            const hit = budgetMonthCache.get(key) ?? null;
            setBudgetMonthId(hit);
            if (!hit) setLoading(true);
        }
        load();
    }, [load, year, month]);

    return { budgetMonthId, loading, error };
};
