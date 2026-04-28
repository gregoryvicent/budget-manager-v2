"use client";

import { useState, useEffect, useCallback, useRef, useContext } from "react";
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
    unassignedGoals: SavingsGoalData[];
    loading: boolean;
    error: string | null;
    isCreating: boolean;
    isUpdating: boolean;
    isDeletingId: string | null;
    isAssigning: boolean;
    isUnlinkingId: string | null;
    add: (title: string, goalAmount: number) => Promise<void>;
    update: (id: string, data: { title?: string; goalAmount?: number }) => Promise<void>;
    remove: (id: string) => Promise<void>;
    assign: (goalId: string) => Promise<void>;
    unlink: (goalId: string, settingId: string) => Promise<void>;
    reload: () => Promise<void>;
    loadUnassigned: () => Promise<void>;
}

/**
 * Manages multiple savings/investment goals for the authenticated user.
 * Fetches goals assigned to a budget month via budgetMonthId, and
 * enriches each with contributedUpTo based on year/month.
 *
 * @param {GoalType} type - Goal type: SAVINGS or INVESTMENT.
 * @param {string | null} budgetMonthId - Active budget month ID for assignment queries.
 * @param {number} year - Selected budget year (for contributedUpTo calculation).
 * @param {number} month - Selected budget month 1-12 (for contributedUpTo calculation).
 * @returns {UseSavingsGoalsState} Goals list, unassigned goals, and CRUD/assign/unlink handlers.
 */
export const useSavingsGoals = (
    type: GoalType,
    budgetMonthId: string | null,
    year: number,
    month: number,
): UseSavingsGoalsState => {
    const [goals, setGoals]                   = useState<SavingsGoalData[]>([]);
    const [unassignedGoals, setUnassignedGoals] = useState<SavingsGoalData[]>([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState<string | null>(null);
    const [isCreating, setIsCreating]         = useState(false);
    const [isUpdating, setIsUpdating]         = useState(false);
    const [isDeletingId, setIsDeletingId]     = useState<string | null>(null);
    const [isAssigning, setIsAssigning]       = useState(false);
    const [isUnlinkingId, setIsUnlinkingId]   = useState<string | null>(null);
    const alertCtx = useContext(AlertContext);
    const cacheCtx = useContext(CacheContext);
    const fetchFn = cacheCtx?.cachedFetch ?? fetch;
    const prevKeyRef = useRef(`${type}-${budgetMonthId}`);

    // Clear data when type/budgetMonthId changes so skeletons show for uncached months
    useEffect(() => {
        const key = `${type}-${budgetMonthId}`;
        if (prevKeyRef.current !== key) {
            prevKeyRef.current = key;
            setGoals([]);
            setUnassignedGoals([]);
        }
    }, [type, budgetMonthId]);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFn(`/api/savings-goals?type=${type}&budgetMonthId=${budgetMonthId}`);
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
    }, [type, budgetMonthId, year, month, fetchFn]);

    useEffect(() => { load(); }, [load]);

    const loadUnassigned = useCallback(async () => {
        if (!budgetMonthId) return;
        try {
            const res = await fetchFn(`/api/savings-goals?type=${type}&unassignedFor=${budgetMonthId}`);
            const list = await res.json();
            if (!res.ok) throw new Error(list.error);
            setUnassignedGoals(list);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al cargar metas no asignadas.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        }
    }, [type, budgetMonthId, fetchFn, alertCtx]);

    // Load unassigned goals whenever budgetMonthId changes
    useEffect(() => { loadUnassigned(); }, [loadUnassigned]);

    const add = async (title: string, goalAmount: number) => {
        if (isCreating || !budgetMonthId) return;
        setIsCreating(true);
        try {
            const res = await fetchFn("/api/savings-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ type, title, goalAmount, budgetMonthId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const goal = data.goal ?? data;
            setGoals(prev => [...prev, { ...goal, contributedUpTo: 0 }]);
            // Remove from unassigned if it was there
            setUnassignedGoals(prev => prev.filter(g => g.id !== goal.id));
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
                    "Idempotency-Key": generateIdempotencyKey(),
                },
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

    const assign = async (goalId: string) => {
        if (isAssigning || !budgetMonthId) return;
        setIsAssigning(true);
        try {
            const res = await fetchFn("/api/goal-month-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ savingsGoalId: goalId, budgetMonthId, allocationPct: 0 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Move goal from unassigned to assigned list with contributedUpTo
            const assignedGoal = unassignedGoals.find(g => g.id === goalId);
            if (assignedGoal) {
                // Fetch contributedUpTo for the newly assigned goal
                const detailRes = await fetchFn(
                    `/api/savings-goals/${goalId}?year=${year}&month=${month}`,
                );
                const detail = await detailRes.json();
                setGoals(prev => [...prev, { ...assignedGoal, contributedUpTo: detail.contributedUpTo ?? 0 }]);
                setUnassignedGoals(prev => prev.filter(g => g.id !== goalId));
            }
            alertCtx?.addAlert({ variant: "success", message: "Meta asignada al mes correctamente." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al asignar meta.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsAssigning(false);
        }
    };

    const unlink = async (goalId: string, settingId: string) => {
        if (isUnlinkingId) return;
        setIsUnlinkingId(goalId);
        try {
            const res = await fetchFn(`/api/goal-month-settings/${settingId}`, {
                method: "DELETE",
                headers: {
                    "Idempotency-Key": generateIdempotencyKey(),
                },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            // Move goal from assigned to unassigned
            const unlinkedGoal = goals.find(g => g.id === goalId);
            setGoals(prev => prev.filter(g => g.id !== goalId));
            if (unlinkedGoal) {
                setUnassignedGoals(prev => [...prev, unlinkedGoal]);
            }
            alertCtx?.addAlert({ variant: "success", message: "Meta desvinculada del mes." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al desvincular meta.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsUnlinkingId(null);
        }
    };

    return {
        goals, unassignedGoals, loading, error,
        isCreating, isUpdating, isDeletingId, isAssigning, isUnlinkingId,
        add, update, remove, assign, unlink, reload: load, loadUnassigned,
    };
};
