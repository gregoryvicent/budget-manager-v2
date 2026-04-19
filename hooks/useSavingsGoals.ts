"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { AlertContext } from "@/contexts/AlertContext";
import { CacheContext } from "@/contexts/CacheContext";

export type GoalType = "SAVINGS" | "INVESTMENT";

export interface SavingsGoalData {
    id: string;
    type: GoalType;
    title: string;
    goalAmount: number;
    totalContributed: number;
    /** Accumulated contributions up to the selected month. */
    contributedUpTo: number;
}

interface UseSavingsGoalsState {
    goals: SavingsGoalData[];
    loading: boolean;
    error: string | null;
    isCreating: boolean;
    isUpdating: boolean;
    isDeletingId: string | null;
    add: (title: string, goalAmount: number) => Promise<void>;
    update: (id: string, data: { title?: string; goalAmount?: number }) => Promise<void>;
    remove: (id: string) => Promise<void>;
    reload: () => Promise<void>;
}

/**
 * Manages multiple savings/investment goals for the authenticated user.
 * Fetches contributedUpTo for each goal based on the selected year/month.
 *
 * @param {GoalType} type - Goal type: SAVINGS or INVESTMENT.
 * @param {number} year - Selected budget year.
 * @param {number} month - Selected budget month (1-12).
 * @returns {UseSavingsGoalsState} Goals list and CRUD handlers.
 */
export const useSavingsGoals = (type: GoalType, year: number, month: number): UseSavingsGoalsState => {
    const [goals, setGoals]           = useState<SavingsGoalData[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const alertCtx = useContext(AlertContext);
    const cacheCtx = useContext(CacheContext);
    const fetchFn = cacheCtx?.cachedFetch ?? fetch;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFn(`/api/savings-goals?type=${type}&year=${year}&month=${month}`);
            const list = await res.json();
            if (!res.ok) throw new Error(list.error);

            // Fetch contributedUpTo for each goal in parallel.
            const enriched: SavingsGoalData[] = await Promise.all(
                list.map(async (g: SavingsGoalData) => {
                    const detailRes = await fetchFn(
                        `/api/savings-goals/${g.id}?year=${year}&month=${month}`,
                    );
                    const detail = await detailRes.json();
                    return { ...g, contributedUpTo: detail.contributedUpTo ?? 0 };
                }),
            );
            setGoals(enriched);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar metas.");
        } finally {
            setLoading(false);
        }
    }, [type, year, month, fetchFn]);

    useEffect(() => { load(); }, [load]);

    const add = async (title: string, goalAmount: number) => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const res = await fetchFn("/api/savings-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ type, title, goalAmount, year, month }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setGoals(prev => [...prev, { ...data, contributedUpTo: 0 }]);
            alertCtx?.addAlert({ variant: "success", message: `Meta "${title}" creada correctamente.` });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al crear meta.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (id: string, data: { title?: string; goalAmount?: number }) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const res = await fetchFn(`/api/savings-goals/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.error);
            setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
            alertCtx?.addAlert({ variant: "success", message: "Meta actualizada correctamente." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al actualizar meta.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsUpdating(false);
        }
    };

    const remove = async (id: string) => {
        if (isDeletingId) return;
        setIsDeletingId(id);
        try {
            const res = await fetchFn(`/api/savings-goals/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ year, month }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setGoals(prev => prev.filter(g => g.id !== id));
            alertCtx?.addAlert({ variant: "success", message: "Meta eliminada correctamente." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al eliminar meta.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsDeletingId(null);
        }
    };

    return { goals, loading, error, isCreating, isUpdating, isDeletingId, add, update, remove, reload: load };
};
