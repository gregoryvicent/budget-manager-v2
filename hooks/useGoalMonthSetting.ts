"use client";

import { useState, useEffect, useCallback } from "react";

interface GoalMonthSettingState {
    allocationPct: number;
    loading: boolean;
    error: string | null;
    upsert: (allocationPct: number) => Promise<void>;
}

/**
 * Gestiona el porcentaje de asignación de una meta para un mes concreto.
 * Crea o actualiza el GoalMonthSetting automáticamente al llamar a upsert.
 * No carga datos mientras alguno de los parámetros sea null.
 *
 * @param {string | null} savingsGoalId - ID de la meta de ahorro.
 * @param {string | null} budgetMonthId - ID del presupuesto mensual activo.
 * @param {number} [defaultPct=10] - Porcentaje por defecto si no existe configuración.
 * @returns {GoalMonthSettingState} Porcentaje actual y handler de upsert.
 */
export const useGoalMonthSetting = (
    savingsGoalId: string | null,
    budgetMonthId: string | null,
    defaultPct = 0,
): GoalMonthSettingState => {
    const [allocationPct, setAllocationPct] = useState(defaultPct);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!savingsGoalId || !budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/goal-month-settings?budgetMonthId=${budgetMonthId}`,
            );
            const settings: { savingsGoalId: string; allocationPct: number }[] = await res.json();
            const match = settings.find(s => s.savingsGoalId === savingsGoalId);
            if (match) setAllocationPct(match.allocationPct);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar configuración.");
        } finally {
            setLoading(false);
        }
    }, [savingsGoalId, budgetMonthId]);

    useEffect(() => { load(); }, [load]);

    const upsert = async (pct: number) => {
        if (!savingsGoalId || !budgetMonthId) return;
        setAllocationPct(pct);
        const res = await fetch("/api/goal-month-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ savingsGoalId, budgetMonthId, allocationPct: pct }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
    };

    return { allocationPct, loading, error, upsert };
};
