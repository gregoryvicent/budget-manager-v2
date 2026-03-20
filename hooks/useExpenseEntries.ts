"use client";

import { useState, useEffect, useCallback } from "react";
import { type ListItem } from "@/lib/types";

export type ExpenseType = "FIXED" | "VARIABLE";

interface ExpenseEntriesState {
    expenses: ListItem[];
    loading: boolean;
    error: string | null;
    add: (name: string, amount: number) => Promise<void>;
    update: (id: string, name: string, amount: number) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

/**
 * Gestiona los gastos (fijos o variables) de un presupuesto mensual.
 * No carga datos mientras budgetMonthId sea null.
 *
 * @param {string | null} budgetMonthId - ID del presupuesto mensual activo.
 * @param {ExpenseType} type - Tipo de gasto a gestionar: FIXED o VARIABLE.
 * @returns {ExpenseEntriesState} Lista de gastos y handlers CRUD.
 */
export const useExpenseEntries = (budgetMonthId: string | null, type: ExpenseType): ExpenseEntriesState => {
    const [expenses, setExpenses] = useState<ListItem[]>([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/expense-entries?budgetMonthId=${budgetMonthId}&type=${type}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExpenses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar gastos.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId, type]);

    useEffect(() => { load(); }, [load]);

    const add = async (name: string, amount: number) => {
        const res = await fetch("/api/expense-entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ budgetMonthId, name, amount, type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setExpenses(prev => [...prev, data]);
    };

    const update = async (id: string, name: string, amount: number) => {
        const res = await fetch(`/api/expense-entries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setExpenses(prev => prev.map(i => i.id === id ? data : i));
    };

    const remove = async (id: string) => {
        const res = await fetch(`/api/expense-entries/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
        }
        setExpenses(prev => prev.filter(i => i.id !== id));
    };

    return { expenses, loading, error, add, update, remove };
};
