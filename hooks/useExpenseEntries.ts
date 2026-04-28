"use client";

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { type ListItem } from "@/lib/types";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { AlertContext } from "@/contexts/AlertContext";
import { CacheContext } from "@/contexts/CacheContext";

export type ExpenseType = "FIXED" | "VARIABLE";

interface ExpenseEntriesState {
    expenses: ListItem[];
    loading: boolean;
    error: string | null;
    isCreating: boolean;
    isUpdating: boolean;
    isDeletingId: string | null;
    add: (name: string, amount: number) => Promise<void>;
    update: (id: string, name: string, amount: number) => Promise<void>;
    remove: (id: string) => Promise<void>;
    reload: () => Promise<void>;
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
    const [expenses, setExpenses]     = useState<ListItem[]>([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const alertCtx = useContext(AlertContext);
    const cacheCtx = useContext(CacheContext);
    const fetchFn = cacheCtx?.cachedFetch ?? fetch;
    const prevBudgetMonthIdRef = useRef(budgetMonthId);

    // Clear data when budgetMonthId changes so skeletons show for uncached months
    useEffect(() => {
        if (prevBudgetMonthIdRef.current !== budgetMonthId) {
            prevBudgetMonthIdRef.current = budgetMonthId;
            setExpenses([]);
        }
    }, [budgetMonthId]);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFn(`/api/expense-entries?budgetMonthId=${budgetMonthId}&type=${type}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExpenses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar gastos.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId, type, fetchFn]);

    useEffect(() => { load(); }, [load]);

    const add = async (name: string, amount: number) => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const res = await fetchFn("/api/expense-entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ budgetMonthId, name, amount, type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExpenses(prev => [...prev, data]);
            alertCtx?.addAlert({ variant: "success", message: `Gasto "${name}" creado correctamente.` });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al crear gasto.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (id: string, name: string, amount: number) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const res = await fetchFn(`/api/expense-entries/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ name, amount }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setExpenses(prev => prev.map(i => i.id === id ? data : i));
            alertCtx?.addAlert({ variant: "success", message: `Gasto "${name}" actualizado correctamente.` });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al actualizar gasto.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsUpdating(false);
        }
    };

    const remove = async (id: string) => {
        if (isDeletingId) return;
        setIsDeletingId(id);
        try {
            const res = await fetchFn(`/api/expense-entries/${id}`, {
                method: "DELETE",
                headers: { "Idempotency-Key": generateIdempotencyKey() },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setExpenses(prev => prev.filter(i => i.id !== id));
            alertCtx?.addAlert({ variant: "success", message: "Gasto eliminado correctamente." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al eliminar gasto.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsDeletingId(null);
        }
    };

    return { expenses, loading, error, isCreating, isUpdating, isDeletingId, add, update, remove, reload: load };
};
