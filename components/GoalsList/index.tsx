"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check } from "lucide-react";
import SavingsCard from "@/components/SavingsCard";
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, TRANSITIONS, CARD_STYLE } from "@/lib/theme";
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
}

/**
 * Renders a list of savings/investment goal cards with add/remove functionality.
 */
export default function GoalsList({
    title, goals, color, icon, totalIncome,
    goalSettings, onAdd, onUpdate, onRemove, onAllocationChange,
}: GoalsListProps) {
    const [adding, setAdding]         = useState(false);
    const [newTitle, setNewTitle]      = useState("");
    const [newAmount, setNewAmount]    = useState("");
    const [editingId, setEditingId]    = useState<string | null>(null);
    const [editTitle, setEditTitle]    = useState("");
    const [editAmount, setEditAmount]  = useState("");

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

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING["4"] }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    fontFamily: FONTS.heading,
                    fontWeight: FONT_WEIGHTS.bold,
                    fontSize: FONT_SIZES.lg,
                    color: COLORS.text,
                }}>
                    {title}
                </span>
                <button
                    onClick={() => setAdding(a => !a)}
                    style={{
                        display: "flex", alignItems: "center", gap: SPACING["1.5"],
                        background: "none", border: `1px solid ${color}44`,
                        borderRadius: RADIUS.lg, padding: `${SPACING["1.5"]}px ${SPACING["3"]}px`,
                        color, cursor: "pointer", fontSize: FONT_SIZES.cap,
                        fontFamily: FONTS.body, fontWeight: FONT_WEIGHTS.semibold,
                        transition: `background ${TRANSITIONS.fast}`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                    <Plus size={14} /> Nueva meta
                </button>
            </div>

            {/* Add form */}
            {adding && (
                <div style={{
                    ...CARD_STYLE,
                    display: "flex", flexDirection: "column", gap: SPACING["3"],
                    border: `1px solid ${color}44`,
                }}>
                    <input
                        placeholder="Nombre de la meta"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        style={{
                            background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                            borderRadius: RADIUS.md, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                            color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                            outline: "none",
                        }}
                    />
                    <input
                        placeholder="Monto objetivo"
                        type="number"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        style={{
                            background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                            borderRadius: RADIUS.md, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                            color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                            outline: "none",
                        }}
                    />
                    <div style={{ display: "flex", gap: SPACING["2"] }}>
                        <button
                            onClick={handleAdd}
                            style={{
                                flex: 1, padding: `${SPACING["2"]}px`,
                                background: color, border: "none", borderRadius: RADIUS.md,
                                color: COLORS.bg, fontWeight: FONT_WEIGHTS.semibold,
                                fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                cursor: "pointer",
                            }}
                        >
                            Crear
                        </button>
                        <button
                            onClick={() => { setAdding(false); setNewTitle(""); setNewAmount(""); }}
                            style={{
                                padding: `${SPACING["2"]}px ${SPACING["4"]}px`,
                                background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                borderRadius: RADIUS.md, color: COLORS.muted,
                                fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                cursor: "pointer",
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

                if (isEditing) {
                    return (
                        <div key={g.id} style={{
                            ...CARD_STYLE,
                            display: "flex", flexDirection: "column", gap: SPACING["3"],
                            border: `1px solid ${color}44`,
                        }}>
                            <input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                style={{
                                    background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                                    borderRadius: RADIUS.md, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    outline: "none",
                                }}
                            />
                            <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                style={{
                                    background: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                                    borderRadius: RADIUS.md, padding: `${SPACING["2"]}px ${SPACING["3"]}px`,
                                    color: COLORS.text, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                    outline: "none",
                                }}
                            />
                            <div style={{ display: "flex", gap: SPACING["2"] }}>
                                <button
                                    onClick={handleEdit}
                                    style={{
                                        flex: 1, padding: `${SPACING["2"]}px`,
                                        background: color, border: "none", borderRadius: RADIUS.md,
                                        color: COLORS.bg, fontWeight: FONT_WEIGHTS.semibold,
                                        fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                        cursor: "pointer", display: "flex", alignItems: "center",
                                        justifyContent: "center", gap: SPACING["1.5"],
                                    }}
                                >
                                    <Check size={14} /> Guardar
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    style={{
                                        padding: `${SPACING["2"]}px ${SPACING["4"]}px`,
                                        background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                        borderRadius: RADIUS.md, color: COLORS.muted,
                                        fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={g.id}>
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
                                        style={{
                                            background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                            cursor: "pointer", padding: `${SPACING["1.5"]}px ${SPACING["3"]}px`,
                                            borderRadius: RADIUS.md, display: "flex", alignItems: "center",
                                            gap: SPACING["1.5"], color: COLORS.muted,
                                            fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                            transition: `background ${TRANSITIONS.fast}`,
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = color + "18")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                    >
                                        <Pencil size={12} /> Editar
                                    </button>
                                    <button
                                        onClick={() => onRemove(g.id)}
                                        aria-label={`Eliminar meta ${g.title}`}
                                        style={{
                                            background: "none", border: `1px solid ${COLORS.cardBorder}`,
                                            cursor: "pointer", padding: `${SPACING["1.5"]}px ${SPACING["3"]}px`,
                                            borderRadius: RADIUS.md, display: "flex", alignItems: "center",
                                            gap: SPACING["1.5"], color: COLORS.muted,
                                            fontSize: FONT_SIZES.cap, fontFamily: FONTS.body,
                                            transition: `background ${TRANSITIONS.fast}`,
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = COLORS.deficit + "18")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                    >
                                        <Trash2 size={12} /> Eliminar
                                    </button>
                                </>
                            }
                        />
                    </div>
                );
            })}

            {goals.length === 0 && !adding && (
                <div style={{
                    ...CARD_STYLE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: COLORS.muted, fontSize: FONT_SIZES.body, fontFamily: FONTS.body,
                    minHeight: 80,
                }}>
                    Sin metas configuradas
                </div>
            )}
        </div>
    );
}
