"use client";

import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { AlertContext } from "@/contexts/AlertContext";
import { CacheContext } from "@/contexts/CacheContext";

interface GoalSetting {
    id: string;
    savingsGoalId: string;
    allocationPct: number;
}

interface UseGoalMonthSettingsState {
    settings: Map<string, number>;
    /** Map of savingsGoalId -> GoalMonthSetting id (for unlink operations). */
    settingIds: Map<string, string>;
    loading: boolean;
    error: string | null;
    isUpserting: boolean;
    upsert: (savingsGoalId: string, allocationPct: number, amountContributed?: number | null) => Promise<void>;
    reload: () => Promise<void>;
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
    const [settings, setSettings]     = useState<Map<string, number>>(new Map());
    const [settingIds, setSettingIds]   = useState<Map<string, string>>(new Map());
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [isUpserting, setIsUpserting] = useState(false);
    const alertCtx = useContext(AlertContext);
    const cacheCtx = useContext(CacheContext);
    const fetchFn = cacheCtx?.cachedFetch ?? fetch;
    const prevBudgetMonthIdRef = useRef(budgetMonthId);

    // Clear data when budgetMonthId changes so skeletons show for uncached months
    useEffect(() => {
        if (prevBudgetMonthIdRef.current !== budgetMonthId) {
            prevBudgetMonthIdRef.current = budgetMonthId;
            setSettings(new Map());
            setSettingIds(new Map());
        }
    }, [budgetMonthId]);

    const load = useCallback(async () => {
        if (!budgetMonthId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFn(`/api/goal-month-settings?budgetMonthId=${budgetMonthId}`);
            const data: GoalSetting[] = await res.json();
            const map = new Map<string, number>();
            const ids = new Map<string, string>();
            data.forEach(s => {
                map.set(s.savingsGoalId, s.allocationPct);
                ids.set(s.savingsGoalId, s.id);
            });
            setSettings(map);
            setSettingIds(ids);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar configuración.");
        } finally {
            setLoading(false);
        }
    }, [budgetMonthId, fetchFn]);

    useEffect(() => { load(); }, [load]);

    const upsert = async (savingsGoalId: string, allocationPct: number, amountContributed?: number | null) => {
        if (!budgetMonthId || isUpserting) return;
        setIsUpserting(true);
        try {
            setSettings(prev => new Map(prev).set(savingsGoalId, allocationPct));
            const body: Record<string, unknown> = { savingsGoalId, budgetMonthId, allocationPct };
            if (amountContributed !== undefined) body.amountContributed = amountContributed;
            const res = await fetchFn("/api/goal-month-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": generateIdempotencyKey(),
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alertCtx?.addAlert({ variant: "success", message: "Configuración de meta actualizada." });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al actualizar configuración.";
            alertCtx?.addAlert({ variant: "error", message: msg });
        } finally {
            setIsUpserting(false);
        }
    };

    return { settings, settingIds, loading, error, isUpserting, upsert, reload: load };
};
