"use client";

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { type ListItem } from "@/lib/types";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { AlertContext } from "@/contexts/AlertContext";
import { CacheContext } from "@/contexts/CacheContext";

interface IncomeEntriesState {
    incomes: ListItem[];
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
 * Gestiona las fuentes de ingreso de un presupuesto mensual.
 * No carga datos mientras budgetMonthId sea null.
 *
 * @param {string | null} budgetMonthId - ID del presupuesto mensual activo.
 * @returns {IncomeEntriesState} Lista de ingresos y handlers CRUD.
 */
export const useIncomeEntries = (budgetMonthId: string | null): IncomeEntriesState => {
    const [incomes, setIncomes]       = useState<ListItem[]>([]);
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
            setIncomes([]);
        }
    }, [budgetMonthId]);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFn(`/api/income-entries?budgetMonthId=${budgetMonthId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIncomes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar ingresos.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId, fetchFn]);

    useEffect(() => { load(); }, [load]);

    const add = async (name: string, amount: number) => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const res = await fetchFn("/api/income-entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ budgetMonthId, name, amount }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIncomes(prev => [...prev, data]);
            alertCtx?.addAlert({ variant: "success", message: `Ingreso "${name}" creado correctamente.` });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al crear ingreso.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (id: string, name: string, amount: number) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const res = await fetchFn(`/api/income-entries/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify({ name, amount }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIncomes(prev => prev.map(i => i.id === id ? data : i));
            alertCtx?.addAlert({ variant: "success", message: `Ingreso "${name}" actualizado correctamente.` });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al actualizar ingreso.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsUpdating(false);
        }
    };

    const remove = async (id: string) => {
        if (isDeletingId) return;
        setIsDeletingId(id);
        try {
            const res = await fetchFn(`/api/income-entries/${id}`, {
                method: "DELETE",
                headers: { "Idempotency-Key": generateIdempotencyKey() },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setIncomes(prev => prev.filter(i => i.id !== id));
            alertCtx?.addAlert({ variant: "success", message: "Ingreso eliminado correctamente." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al eliminar ingreso.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsDeletingId(null);
        }
    };

    return { incomes, loading, error, isCreating, isUpdating, isDeletingId, add, update, remove, reload: load };
};
