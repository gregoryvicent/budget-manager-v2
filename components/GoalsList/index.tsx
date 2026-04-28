"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, Loader2, Unlink } from "lucide-react";
import SavingsCard from "@/components/SavingsCard";
import GoalAssignSelector from "@/components/GoalAssignSelector";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, TRANSITIONS } from "@/lib/theme";
import type { SavingsGoalData } from "@/hooks/useSavingsGoals";

interface GoalsListProps {
    title: string;
    goals: SavingsGoalData[];
    color: string;
    icon: React.ElementType;
    totalIncome: number;
    goalSettings: Map<string, number>;
    onAdd: (title: string, goalAmount: number) => Promise<void>;
    onUpdate: (id: string, data: { title?: string; goalAmount?: number }) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onAllocationChange: (goalId: string, pct: number, amountContributed: number) => Promise<void>;
    /** Whether a create operation is in progress. */
    isCreating?: boolean;
    /** ID of the goal currently being deleted, or null. */
    isDeletingId?: string | null;
    /** Unassigned goals available for assignment to this month. */
    unassignedGoals?: SavingsGoalData[];
    /** Callback to assign an existing goal to the current month. */
    onAssign?: (goalId: string) => Promise<void>;
    /** Callback to unlink a goal from the current month. */
    onUnlink?: (goalId: string, settingId: string) => Promise<void>;
    /** Whether an assign operation is in progress. */
    isAssigning?: boolean;
    /** ID of the goal currently being unlinked, or null. */
    isUnlinkingId?: string | null;
    /** Map of goalId -> settingId for unlink operations. */
    settingIds?: Map<string, string>;
}

/**
 * Renders a list of savings/investment goal cards with add/remove/assign/unlink functionality.
 * Uses Tailwind responsive classes for mobile-first layout.
 * Mobile: single column, full width, 44px touch targets.
 * Desktop: same column layout with standard spacing.
 */
export default function GoalsList({
    title, goals, color, icon, totalIncome,
    goalSettings, onAdd, onUpdate, onRemove, onAllocationChange,
    isCreating = false, isDeletingId = null,
    unassignedGoals = [], onAssign, onUnlink,
    isAssigning = false, isUnlinkingId = null, settingIds,
}: GoalsListProps) {
    const [adding, setAdding]         = useState(false);
    const [newTitle, setNewTitle]      = useState("");
    const [newAmount, setNewAmount]    = useState("");
    const [editingId, setEditingId]    = useState<string | null>(null);
    const [editTitle, setEditTitle]    = useState("");
    const [editAmount, setEditAmount]  = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newTitle.trim() || !newAmount) return;
        await onAdd(newTitle.trim(), Number(newAmount));
        setNewTitle("");
        setNewAmount("");
        setAdding(false);
    };

    const startEdit = (g: SavingsGoalData) => {
        setEditingId(g.id);
        setEditTitle(g.title);
        setEditAmount(String(g.goalAmount));
    };

    const handleEdit = async () => {
        if (!editingId || !editTitle.trim() || !editAmount) return;
        await onUpdate(editingId, { title: editTitle.trim(), goalAmount: Number(editAmount) });
        setEditingId(null);
    };

    const handleGlobalDelete = async (id: string) => {
        setConfirmDeleteId(null);
        await onRemove(id);
    };

    const isEmpty = goals.length === 0 && !adding;
    const Icon = icon;

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Section header — buttons always visible */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span style={{
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.bold,
                    fontSize: FONT_SIZES.lg,
                    color: COLORS.text,
                }}>
                    {title}
                </span>
                <div className="flex items-center gap-2">
                    {onAssign && (
                        <GoalAssignSelector
                            goals={unassignedGoals}
                            onAssign={onAssign}
                            isAssigning={isAssigning}
                            color={color}
                        />
                    )}
                    <button
                        onClick={() => setAdding(a => !a)}
                        disabled={isCreating}
                        className="flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                        style={{
                            background: "none", border: `1px solid ${color}44`,
                            borderRadius: RADIUS.lg, padding: `6px 12px`,
                            color, fontSize: FONT_SIZES.cap,
                            fontFamily: FONTS.body, fontWeight: FONT_WEIGHTS.semibold,
                            transition: `background ${TRANSITIONS.fast}`,
                            opacity: isCreating ? 0.7 : 1,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                        {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Nueva meta
                    </button>
                </div>
            </div>

            {/* Add form */}
            {adding && (
                <div
                    className="flex flex-col gap-3 p-6 rounded-[16px]"
                    style={{
                        background: COLORS.card,
                        border: `1px solid ${color}44`,
                    }}
                >
                    <input
                        placeholder="Nombre de la meta"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        disabled={isCreating}
                        className="w-full min-h-[44px]"
                        style={{
                            background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                            borderRadius: RADIUS.md, padding: `8px 12px`,
                            color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                            outline: "none", opacity: isCreating ? 0.6 : 1,
                        }}
                    />
                    <input
                        placeholder="Monto objetivo"
                        type="number"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        disabled={isCreating}
                        className="w-full min-h-[44px]"
                        style={{
                            background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                            borderRadius: RADIUS.md, padding: `8px 12px`,
                            color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                            outline: "none", opacity: isCreating ? 0.6 : 1,
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={isCreating}
                            className="flex-1 min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5"
                            style={{
                                padding: `8px`,
                                background: color, border: "none", borderRadius: RADIUS.md,
                                color: COLORS.bg, fontWeight: FONT_WEIGHTS.semibold,
                                fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                opacity: isCreating ? 0.7 : 1,
                            }}
                        >
                            {isCreating ? <Loader2 size={14} className="animate-spin" /> : "Crear"}
                        </button>
                        <button
                            onClick={() => { setAdding(false); setNewTitle(""); setNewAmount(""); }}
                            disabled={isCreating}
                            className="min-h-[44px] cursor-pointer"
                            style={{
                                padding: `8px 16px`,
                                background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                borderRadius: RADIUS.md, color: COLORS.muted,
                                fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Goal cards */}
            {goals.map(g => {
                const pct = goalSettings.get(g.id) ?? 0;
                const monthlyAllocation = totalIncome * (pct / 100);
                const isEditing = editingId === g.id;
                const isUnlinking = isUnlinkingId === g.id;
                const isDeleting = isDeletingId === g.id;
                const settingId = settingIds?.get(g.id);

                if (isEditing) {
                    return (
                        <div
                            key={g.id}
                            className="flex flex-col gap-3 p-6 rounded-[16px]"
                            style={{
                                background: COLORS.card,
                                border: `1px solid ${color}44`,
                            }}
                        >
                            <input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full min-h-[44px]"
                                style={{
                                    background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                                    borderRadius: RADIUS.md, padding: `8px 12px`,
                                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    outline: "none",
                                }}
                            />
                            <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                className="w-full min-h-[44px]"
                                style={{
                                    background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                                    borderRadius: RADIUS.md, padding: `8px 12px`,
                                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    outline: "none",
                                }}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                                    style={{
                                        padding: `8px`,
                                        background: color, border: "none", borderRadius: RADIUS.md,
                                        color: COLORS.bg, fontWeight: FONT_WEIGHTS.semibold,
                                        fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    }}
                                >
                                    <Check size={14} /> Guardar
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="min-h-[44px] cursor-pointer"
                                    style={{
                                        padding: `8px 16px`,
                                        background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                        borderRadius: RADIUS.md, color: COLORS.muted,
                                        fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={g.id} className="w-full" style={{
                        opacity: (isDeleting || isUnlinking) ? 0.5 : 1,
                        pointerEvents: (isDeleting || isUnlinking) ? "none" : "auto",
                        transition: `opacity ${TRANSITIONS.base}`,
                    }}>
                        <SavingsCard
                            title={g.title}
                            saved={g.contributedUpTo}
                            goal={g.goalAmount}
                            color={color}
                            icon={icon}
                            allocationPct={pct}
                            monthlyAllocation={monthlyAllocation}
                            onAllocationPctChange={(newPct) => {
                                const contributed = totalIncome * (newPct / 100);
                                onAllocationChange(g.id, newPct, contributed);
                            }}
                            actions={
                                <>
                                    <button
                                        onClick={() => startEdit(g)}
                                        aria-label={`Editar meta ${g.title}`}
                                        className="flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                                        style={{
                                            background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                            padding: `6px 12px`,
                                            borderRadius: RADIUS.md,
                                            color: COLORS.muted,
                                            fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                            transition: `background ${TRANSITIONS.fast}`,
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                    >
                                        <Pencil size={12} /> Editar
                                    </button>
                                    {onUnlink && settingId && (
                                        <button
                                            onClick={() => onUnlink(g.id, settingId)}
                                            disabled={isUnlinking}
                                            aria-label={`Desvincular meta ${g.title} del mes`}
                                            className="flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                                            style={{
                                                background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                                padding: `6px 12px`,
                                                borderRadius: RADIUS.md,
                                                color: COLORS.muted,
                                                fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                                transition: `background ${TRANSITIONS.fast}`,
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = COLORS.goal + "18")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                        >
                                            {isUnlinking ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />} Desvincular
                                        </button>
                                    )}
                                    {confirmDeleteId === g.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleGlobalDelete(g.id)}
                                                disabled={isDeleting}
                                                className="flex items-center gap-1 min-h-[44px] cursor-pointer"
                                                style={{
                                                    background: COLORS.deficit + "20", border: `1px solid ${COLORS.deficit}44`,
                                                    padding: `6px 12px`,
                                                    borderRadius: RADIUS.md,
                                                    color: COLORS.deficit,
                                                    fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                                }}
                                            >
                                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Confirmar
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="flex items-center min-h-[44px] cursor-pointer"
                                                style={{
                                                    background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                                    padding: `6px 12px`,
                                                    borderRadius: RADIUS.md,
                                                    color: COLORS.muted,
                                                    fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDeleteId(g.id)}
                                            disabled={isDeleting}
                                            aria-label={`Eliminar meta ${g.title}`}
                                            className="flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                                            style={{
                                                background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                                padding: `6px 12px`,
                                                borderRadius: RADIUS.md,
                                                color: COLORS.muted,
                                                fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                                transition: `background ${TRANSITIONS.fast}`,
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = COLORS.deficit + "18")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                        >
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    )}
                                </>
                            }
                        />
                    </div>
                );
            })}

            {isEmpty && (
                <div
                    className="flex flex-col items-center justify-center gap-3 py-8 px-6 rounded-[16px]"
                    style={{
                        background: COLORS.card,
                        border: `1px dashed ${color}33`,
                    }}
                >
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: 44, height: 44,
                            borderRadius: RADIUS["2xl"],
                            background: `${color}15`,
                            color,
                        }}
                    >
                        <Icon size={22} />
                    </div>
                    <span style={{
                        color: COLORS.muted,
                        fontSize: FONT_SIZES.body,
                        fontFamily: FONTS.body,
                    }}>
                        {unassignedGoals.length > 0
                            ? "Sin metas asignadas a este mes"
                            : "No hay metas creadas aún"}
                    </span>
                </div>
            )}
        </div>
    );
}
