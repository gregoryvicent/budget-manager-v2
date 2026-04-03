"use client";

import { useState, useEffect, useCallback } from "react";

export type GoalType = "SAVINGS" | "INVESTMENT";

export interface SavingsGoalData {
    id: string;
    title: string;
    goalAmount: number;
    totalContributed: number;
}

interface SavingsGoalState {
    goal: SavingsGoalData | null;
    loading: boolean;
    error: string | null;
    updateGoal: (data: { title?: string; goalAmount?: number }) => Promise<void>;
}

/**
 * Gets or creates a savings/investment goal for the authenticated user
 * and computes the total contributed across all months.
 * The userId is extracted from the session on the server side.
 *
 * @param {GoalType} type - Goal type: SAVINGS or INVESTMENT.
 * @returns {SavingsGoalState} Goal data and update handler.
 */
export const useSavingsGoal = (type: GoalType): SavingsGoalState => {
    const [goal, setGoal]       = useState<SavingsGoalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get or create the goal.
            const goalRes = await fetch("/api/savings-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });
            const goalData = await goalRes.json();
            if (!goalRes.ok) throw new Error(goalData.error);

            // Fetch all monthly settings to compute total contributed.
            const settingsRes = await fetch(`/api/goal-month-settings?savingsGoalId=${goalData.id}`);
            const settings: { amountContributed: number | null }[] = await settingsRes.json();

            const totalContributed = settings.reduce(
                (sum, s) => sum + (s.amountContributed ?? 0),
                0,
            );

            setGoal({ ...goalData, totalContributed });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar meta.");
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => { load(); }, [load]);

    const updateGoal = async (data: { title?: string; goalAmount?: number }) => {
        if (!goal) return;
        const res = await fetch(`/api/savings-goals/${goal.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error);
        setGoal(prev => prev ? { ...prev, ...updated } : null);
    };

    return { goal, loading, error, updateGoal };
};
