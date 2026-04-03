"use client";

import { useState, useEffect, useCallback } from "react";

interface GoalSetting {
    savingsGoalId: string;
    allocationPct: number;
}

interface UseGoalMonthSettingsState {
    settings: Map<string, number>;
    loading: boolean;
    error: string | null;
    upsert: (savingsGoalId: string, allocationPct: number, amountContributed?: number | null) => Promise<void>;
}

/**
 * Manages allocation percentages for all goals in a given budget month.
 * Returns a Map of savingsGoalId -> allocationPct.
 *
 * @param {string | null} budgetMonthId - Active budget month ID.
 * @returns {UseGoalMonthSettingsState} Settings map and upsert handler.
 */
export const useGoalMonthSettings = (
    budgetMonthId: string | null,
): UseGoalMonthSettingsState => {
    const [settings, setSettings] = useState<Map<string, number>>(new Map());
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/goal-month-settings?budgetMonthId=${budgetMonthId}`);
            const data: GoalSetting[] = await res.json();
            const map = new Map<string, number>();
            data.forEach(s => map.set(s.savingsGoalId, s.allocationPct));
            setSettings(map);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar configuración.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId]);

    useEffect(() => { load(); }, [load]);

    const upsert = async (savingsGoalId: string, allocationPct: number, amountContributed?: number | null) => {
        if (!budgetMonthId) return;
        setSettings(prev => new Map(prev).set(savingsGoalId, allocationPct));
        const body: Record<string, unknown> = { savingsGoalId, budgetMonthId, allocationPct };
        if (amountContributed !== undefined) body.amountContributed = amountContributed;
        const res = await fetch("/api/goal-month-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
    };

    return { settings, loading, error, upsert };
};
