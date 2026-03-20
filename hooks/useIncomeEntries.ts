"use client";

import { useState, useEffect, useCallback } from "react";
import { type ListItem } from "@/lib/types";

interface IncomeEntriesState {
    incomes: ListItem[];
    loading: boolean;
    error: string | null;
    add: (name: string, amount: number) => Promise<void>;
    update: (id: string, name: string, amount: number) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

/**
 * Gestiona las fuentes de ingreso de un presupuesto mensual.
 * No carga datos mientras budgetMonthId sea null.
 *
 * @param {string | null} budgetMonthId - ID del presupuesto mensual activo.
 * @returns {IncomeEntriesState} Lista de ingresos y handlers CRUD.
 */
export const useIncomeEntries = (budgetMonthId: string | null): IncomeEntriesState => {
    const [incomes, setIncomes] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/income-entries?budgetMonthId=${budgetMonthId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIncomes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar ingresos.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId]);

    useEffect(() => { load(); }, [load]);

    const add = async (name: string, amount: number) => {
        const res = await fetch("/api/income-entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budgetMonthId, name, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setIncomes(prev => [...prev, data]);
    };

    const update = async (id: string, name: string, amount: number) => {
        const res = await fetch(`/api/income-entries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setIncomes(prev => prev.map(i => i.id === id ? data : i));
    };

    const remove = async (id: string) => {
        const res = await fetch(`/api/income-entries/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
        setIncomes(prev => prev.filter(i => i.id !== id));
    };

    return { incomes, loading, error, add, update, remove };
};
