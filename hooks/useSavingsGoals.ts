"use client";

import { useState, useEffect, useCallback } from "react";

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
    const [goals, setGoals]     = useState<SavingsGoalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/savings-goals?type=${type}`);
            const list = await res.json();
            if (!res.ok) throw new Error(list.error);

            // Fetch contributedUpTo for each goal in parallel.
            const enriched: SavingsGoalData[] = await Promise.all(
                list.map(async (g: SavingsGoalData) => {
                    const detailRes = await fetch(
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
    }, [type, year, month]);

    useEffect(() => { load(); }, [load]);

    const add = async (title: string, goalAmount: number) => {
        const res = await fetch("/api/savings-goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, title, goalAmount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGoals(prev => [...prev, { ...data, contributedUpTo: 0 }]);
    };

    const update = async (id: string, data: { title?: string; goalAmount?: number }) => {
        const res = await fetch(`/api/savings-goals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error);
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
    };

    const remove = async (id: string) => {
        const res = await fetch(`/api/savings-goals/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    return { goals, loading, error, add, update, remove, reload: load };
};
