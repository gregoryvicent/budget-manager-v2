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
 * Obtiene o crea la meta de ahorro/inversión de un usuario y calcula el total acumulado
 * sumando los aportes confirmados de todos los meses.
 *
 * @param {string} userId - ID del usuario activo.
 * @param {GoalType} type - Tipo de meta: SAVINGS o INVESTMENT.
 * @returns {SavingsGoalState} Datos de la meta y handler de actualización.
 */
export const useSavingsGoal = (userId: string, type: GoalType): SavingsGoalState => {
    const [goal, setGoal]     = useState<SavingsGoalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get or create the goal.
            const goalRes = await fetch("/api/savings-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, type }),
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
    }, [userId, type]);

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
