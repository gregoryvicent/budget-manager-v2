"use client";

import { useState, useEffect, useCallback } from "react";

interface BudgetMonthState {
    budgetMonthId: string | null;
    loading: boolean;
    error: string | null;
}

/**
 * Obtiene o crea el presupuesto mensual para un usuario dado.
 * Se re-ejecuta automáticamente al cambiar año o mes.
 *
 * @param {string} userId - ID del usuario activo.
 * @param {number} year - Año del presupuesto.
 * @param {number} month - Mes del presupuesto (1-12).
 * @returns {BudgetMonthState} ID del presupuesto y estado de carga.
 */
export const useBudgetMonth = (userId: string, year: number, month: number): BudgetMonthState => {
    const [budgetMonthId, setBudgetMonthId] = useState<string | null>(null);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setBudgetMonthId(null);
        try {
            const res = await fetch("/api/budgets/get-or-create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, year, month }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error al cargar presupuesto.");
            setBudgetMonthId(data.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido.");
        } finally {
            setLoading(false);
        }
    }, [userId, year, month]);

    useEffect(() => { load(); }, [load]);

    return { budgetMonthId, loading, error };
};
